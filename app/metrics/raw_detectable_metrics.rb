#TODO: REPLACE

require 'json'

module Metrics
	class RawDetectableMetrics
		def initialize(video)
			@video = video
			@width = 1280
			@height = 720

			# event score
			maxTimeSeconds = 5
			timeDecayWeight = [0.05, 0.1, 0.15, 0.2, 0.3]
			@eventDistance = Metrics::EventDistance.new(video.game.events, maxTimeSeconds, timeDecayWeight)

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
		end

		def populate
			@video.video_frames.includes(:detections).find_each(batch_size: 100) do |video_frame|
				# if video_frame.id == 1940
				# 	puts "VF ID: #{video_frame.id}"

					# initialize variables for this frame
					intersectionQuadrants = {}    # quadrant information of detections
					spatialEffectiveness = {}     # spatial effectiveness
					visualSaliency = {}           # visual saliency
					detectionsCount = {}          # num of detections per detectable
					cumulativeArea = {}           # area of detections per detectable as fraction of frame area
					eventScore = {}               # event score if detectable present in frame
					@detectable_ids.each do |id|
						intersectionQuadrants[id] = find_intersection_quadrants([])
						spatialEffectiveness[id] = 0
						visualSaliency[id] = 0
						detectionsCount[id] = 0
						cumulativeArea[id] = 0
						eventScore[id] = 0
					end
					# group detections by detectables
					video_frame.detections.group_by {|d| d.detectable_id}.each do |id, detections|
						intersectionQuadrants[id] = find_intersection_quadrants(detections)
						spatialEffectiveness[id] = spatial_effectiveness(intersectionQuadrants[id])
						visualSaliency[id] = get_score_averages(detections)
						detectionsCount[id] = detections.count
						cumulativeArea[id] = get_cumulative_area(detections)
						eventScore[id] = get_event_score(detections, video_frame.frame_time)
					end
					# populate sliding window
					@detectable_ids.each do |id|
						@slidingWindowScores[id].add(visualSaliency[id])
						visualSaliency[id] = @slidingWindowScores[id].get_decayed_average
					end

					@detectable_ids.each do |id|
						video_frame.raw_detectables.create(
							spatial_effectiveness: spatialEffectiveness[id],
							visual_saliency: visualSaliency[id],
							detections_count: detectionsCount[id],
							cumulative_area: cumulativeArea[id],
							event_score: eventScore[id],
							quadrants: intersectionQuadrants[id].to_json,
							detectable_id: id)
						# puts "DetectableID: #{id}, " + 
						# 	"intersectionQuadrants: #{intersectionQuadrants[id]}, " + 
						# 	"spatialEffectiveness: #{spatialEffectiveness[id]}, " + 
						# 	"visualSaliency: #{visualSaliency[id]}, " + 
						# 	"detectionsCount: #{detectionsCount[id]}"
					end

				# 	break
				# end
			end
			true
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
				score += d.score
			end
			score = score/detections.count if detections.count > 0
			return score
		end

		def get_cumulative_area(detections)
			area = 0.0
			detections.each do |d|
				area += d.area
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
					intersection_quads[qNum] += (overlap(detection.bbox, qBbox)/(@numCols * @numRows))
				end
			end
			# reweight
			@quadrants.each do |qNum, qBbox|
				intersection_quads[qNum] = intersection_quads[qNum] * @quadrant_weights[qNum]
			end
			# limit decimal points
			@quadrants.each do |qNum, qBbox|
				intersection_quads[qNum] = (intersection_quads[qNum]).round(5)
			end
			#puts intersection_quads
			return intersection_quads
		end

		# overlap fraction based on area of bbox2
		def overlap(bbox1, bbox2)
			width = bbox2[:x3] - bbox2[:x0]
			height = bbox2[:y3] - bbox2[:y0]
			xOverlap = [0, ([bbox1[:x3], bbox2[:x3]].min - [bbox1[:x0], bbox2[:x0]].max)].max
			yOverlap = [0, ([bbox1[:y3], bbox2[:y3]].min - [bbox1[:y0], bbox2[:y0]].max)].max
			return (1.0 * xOverlap * yOverlap / (width * height))
		end

	end
end