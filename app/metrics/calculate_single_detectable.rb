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
				@configReader.dm_es_timeDecayWeights)

			# sliding window
			@slidingWindowScores = Metrics::MetricsSlidingWindow.new(
				@video.detection_frame_rate,
				@configReader.dm_sw_size_seconds_scores,
				@configReader.dm_sw_decayWeights_scores)

			@slidingWindowDetectionsCount = Metrics::MetricsSlidingWindow.new(
				@video.detection_frame_rate,
				@configReader.dm_sw_size_seconds_detectionsCount,
				nil)

			# quadrants in frame
			@metricsQuads = Metrics::MetricsQuadrants.new(@width, @height, configReader)

			# view duration
			@timeForSingleFrame = States::ConfigReader.frameTimeStampResolution / @video.detection_frame_rate
		end

		def calculate(frameTime, detections)
			# frameTime : time of frame
			# detections : raw scores from localization.json from khajuri

			# spatial position: quadrant information of detections
			intersectionQuadrants = @metricsQuads.find_intersection_quadrants(detections)

			# spatial effectiveness: derived from spatial position
			spatialEffectiveness = spatial_effectiveness(intersectionQuadrants)

			# visual saliency: decayed average of detection scores
			@slidingWindowScores.add(get_score_max(detections))
			visualSaliency = @slidingWindowScores.get_decayed_average()

			# detection count: count detections in window and reset to avoid double counting
			@slidingWindowDetectionsCount.add(detections.count)
			detectionsCount = @slidingWindowDetectionsCount.get_min()
			@slidingWindowDetectionsCount.reset() if detectionsCount > 0

			# view duration: count interval time of consecutive detections
			viewDuration = detections.count > 0 ? @timeForSingleFrame : 0

			# brand group crowding: area of detections per detectable as fraction of frame area
			cumulativeArea = get_cumulative_area(detections)

			# timing effectiveness: event score if detectable present in frame
			eventScore = get_event_score(detections, frameTime)

			# Note: this is tied to schema in SingleDetectableMetric class
			detectableMetrics = {
				di: @detectableId,
				se: spatialEffectiveness,
				vs: visualSaliency,
				dc: detectionsCount,
				vd: viewDuration,
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

		def get_score_max(detections)
			score = 0.0
			detections.each do |d|
				score = d[:score] if d[:score] > score
			end
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

	end
end