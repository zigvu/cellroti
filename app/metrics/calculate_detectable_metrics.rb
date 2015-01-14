module Metrics
	class CalculateDetectableMetrics
		def initialize(video)
			@video = video
			@width = @video.width
			@height = @video.height
			@frameRateToMSFactor = 1000.0 / @video.playback_frame_rate

			# event score
			maxTimeSeconds = 5
			timeDecayWeight = [0.05, 0.1, 0.15, 0.2, 0.3]
			@eventDistance = Metrics::EventDistance.new(@video.game.events, maxTimeSeconds, timeDecayWeight)

			# sliding window
			@slidingWindowSize = 5
			@slidingWindowDecayValues = [0.05, 0.05, 0.1, 0.3, 0.5]
			@detectable_ids = Detectable.pluck(:id)
			@slidingWindowScores = Metrics::SlidingWindow.get_sliding_window_hash(
				@detectable_ids, @slidingWindowSize, @slidingWindowDecayValues)
			
			# number of quadrants in frame
			@numCols = 3
			@numRows = 3
			metricsQuads = Metrics::Quadrants.new(@width, @height, @numCols, @numRows)
			@quadrant_weights = metricsQuads.get_quadrant_weights
			@quadrants = metricsQuads.get_quadrant_boundaries

			@mongoBatchInsertSize = 1000
		end

		def calculate
			# sanity check
			videoDetections = @video.video_detections.first
			raise "Video has no detections saved" if videoDetections == nil

			# create metric entry
			detectableMetric = DetectableMetric.create(video_id: @video.id)

			# save scores in array
			detectableMetricHashArr = []

			# retrieve detections
			allDetections = videoDetections.detections
			allDetectableIds = videoDetections.detectable_ids
			# sort detections by frame number
			sortedFrameNums = allDetections.keys.collect{|i| i.to_i}.sort
			sortedFrameNums.each do |frameNum|
				# puts "Working on frame number: #{frameNum}"
				frameTime = (frameNum * @frameRateToMSFactor).to_i

				allDetectableIds.each do |detectableId|
					# get detections or empty array if no detections
					detections = allDetections[frameNum.to_s][detectableId.to_s] || []

					# quadrant information of detections
					intersectionQuadrants = find_intersection_quadrants(detections)
					# spatial effectiveness
					spatialEffectiveness = spatial_effectiveness(intersectionQuadrants)
					# visual saliency
					@slidingWindowScores[detectableId.to_i].add(get_score_averages(detections))
					visualSaliency = @slidingWindowScores[detectableId.to_i].get_decayed_average
					# num of detections per detectable
					detectionsCount = detections.count
					# area of detections per detectable as fraction of frame area
					cumulativeArea = get_cumulative_area(detections)
					# event score if detectable present in frame
					eventScore = get_event_score(detections, frameTime)

					# populate variables for this frame and detectableId
					# Note: this is tied to schema in SingleDetectableMetric class
					detectableMetricHashArr << {
						fn: frameNum,
						ft: frameTime,
						di: detectableId.to_i,
						se: spatialEffectiveness,
						vs: visualSaliency,
						dc: detectionsCount,
						ca: cumulativeArea,
						es: eventScore,
						qd: intersectionQuadrants,
						detectable_metric_id: detectableMetric.id
					}
					# if batch size reached, then write to db
					if detectableMetricHashArr.count >= @mongoBatchInsertSize
						SingleDetectableMetric.collection.insert(detectableMetricHashArr)
						detectableMetricHashArr = []
					end
				end
			end
			# write the last batch to db
			if detectableMetricHashArr.count > 0
				SingleDetectableMetric.collection.insert(detectableMetricHashArr)
			end

			return true
		end

		def calculate_orig
			# sanity check
			videoDetections = @video.video_detections.first
			raise "Video has no detections saved" if videoDetections == nil

			# save scores in array
			detectableMetrics = []

			# retrieve detections
			allDetections = videoDetections.detections
			allDetectableIds = videoDetections.detectable_ids
			# sort detections by frame number
			sortedFrameNums = allDetections.keys.collect{|i| i.to_i}.sort
			sortedFrameNums.each do |frameNum|
				# puts "Working on frame number: #{frameNum}"
				frameTime = (frameNum * @frameRateToMSFactor).to_i

				allDetectableIds.each do |detectableId|
					# get detections or empty array if no detections
					detections = allDetections[frameNum.to_s][detectableId.to_s] || []

					# quadrant information of detections
					intersectionQuadrants = find_intersection_quadrants(detections)
					# spatial effectiveness
					spatialEffectiveness = spatial_effectiveness(intersectionQuadrants)
					# visual saliency
					@slidingWindowScores[detectableId.to_i].add(get_score_averages(detections))
					visualSaliency = @slidingWindowScores[detectableId.to_i].get_decayed_average
					# num of detections per detectable
					detectionsCount = detections.count
					# area of detections per detectable as fraction of frame area
					cumulativeArea = get_cumulative_area(detections)
					# event score if detectable present in frame
					eventScore = get_event_score(detections, frameTime)

					# populate variables for this frame and detectableId
					# Note: this is tied to schema in SingleDetectableMetric class
					detectableMetrics << SingleDetectableMetric.new({
						frame_number: frameNum,
						frame_time: frameTime,
						detectable_id: detectableId.to_i,
						spatial_effectiveness: spatialEffectiveness,
						visual_saliency: visualSaliency,
						detections_count: detectionsCount,
						cumulative_area: cumulativeArea,
						event_score: eventScore,
						quadrants: intersectionQuadrants
					})
				end
			end
			return detectableMetrics
		end

		def get_event_score(detections, frameTime)
			score = 0.0
			if detections.count > 0
				score = @eventDistance.get_event_score(frameTime)
			end
			return score
		end

		def get_score_averages(detections)
			score = 0.0
			detections.each do |d|
				score += d[:score]
			end
			score = score/detections.count if detections.count > 0
			return score
		end

		def get_cumulative_area(detections)
			area = 0.0
			detections.each do |d|
				area += d[:bbox][:width] * d[:bbox][:height]
			end
			area = area / (@width * @height)
			return area
		end

		def spatial_effectiveness(intersection_quads)
			effectiveness = 0
			# for now, just add across all quadrants
			intersection_quads.each do |k, v|
				effectiveness += v
			end
			effectiveness = 1 if effectiveness > 1.0
			#puts "#{effectiveness}"
			return effectiveness
		end

		def find_intersection_quadrants(detections)
			intersection_quads = {}
			# initialize data structure
			@quadrants.each do |qNum, qBbox|
				intersection_quads[qNum] = 0
			end
			# combine multiple detections
			detections.each do |detection|
				@quadrants.each do |qNum, qBbox|
					intersection_quads[qNum] += (overlap(detection[:bbox], qBbox)/(@numCols * @numRows))
				end
			end
			# reweight
			@quadrants.each do |qNum, qBbox|
				intersection_quads[qNum] = intersection_quads[qNum] * @quadrant_weights[qNum]
			end
			#puts intersection_quads
			return intersection_quads
		end

		# overlap fraction based on area of bbox2
		def overlap(bbox1, bbox2)
			b1_x0 = bbox1[:x]
			b1_x3 = bbox1[:width] + bbox1[:x]
			b1_y0 = bbox1[:y]
			b1_y3 = bbox1[:height] + bbox1[:y]

			b2_x0 = bbox2[:x]
			b2_x3 = bbox2[:width] + bbox2[:x]
			b2_y0 = bbox2[:y]
			b2_y3 = bbox2[:height] + bbox2[:y]

			width = bbox2[:width]
			height = bbox2[:height]

			xOverlap = [0, ([b1_x3, b2_x3].min - [b1_x0, b2_x0].max)].max
			yOverlap = [0, ([b1_y3, b2_y3].min - [b1_y0, b2_y0].max)].max
			return (1.0 * xOverlap * yOverlap / (width * height))
		end

	end
end