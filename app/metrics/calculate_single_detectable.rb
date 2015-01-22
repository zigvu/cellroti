module Metrics
	class CalculateSingleDetectable
		def initialize(configReader, video, detectableId)
			@configReader = configReader
			@video = video
			@detectableId = detectableId

			@width = @video.width
			@height = @video.height

			# event score
			@eventDistance = Metrics::MetricsEventDistance.new(
				@video.game.events, 
				@configReader.dm_es_maxTimeSeconds, 
				@configReader.dm_es_timeDecayWeight)

			# sliding window
			@slidingWindowScores = Metrics::MetricsSlidingWindow.new(
				@configReader.dm_sw_size,
				@configReader.dm_sw_decayValues)

			
			# number of quadrants in frame
			@numCols = @configReader.dm_qd_numCols
			@numRows = @configReader.dm_qd_numRows
			metricsQuads = Metrics::MetricsQuadrants.new(@width, @height, @numCols, @numRows)
			@quadrant_weights = metricsQuads.get_quadrant_weights
			@quadrants = metricsQuads.get_quadrant_boundaries
		end

		def calculate(frameTime, detections)
			# frameTime : time of frame
			# detections : raw scores from localization.json from khajuri

			# save scores in array
			detectableMetrics = []

			# quadrant information of detections
			intersectionQuadrants = find_intersection_quadrants(detections)
			# spatial effectiveness
			spatialEffectiveness = spatial_effectiveness(intersectionQuadrants)
			# visual saliency
			@slidingWindowScores.add(get_score_averages(detections))
			visualSaliency = @slidingWindowScores.get_decayed_average
			# num of detections per detectable
			detectionsCount = detections.count
			# area of detections per detectable as fraction of frame area
			cumulativeArea = get_cumulative_area(detections)
			# event score if detectable present in frame
			eventScore = get_event_score(detections, frameTime)

			# Note: this is tied to schema in SingleDetectableMetric class
			detectableMetrics << {
				di: @detectableId,
				se: spatialEffectiveness,
				vs: visualSaliency,
				dc: detectionsCount,
				ca: cumulativeArea,
				es: eventScore,
				qd: intersectionQuadrants,
			}

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