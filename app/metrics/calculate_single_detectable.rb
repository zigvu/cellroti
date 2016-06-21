module Metrics
  class CalculateSingleDetectable
    def initialize(configReader, video, detectableId)
      @configReader = configReader
      @video = video
      @detectableId = detectableId

      @width = @video.width
      @height = @video.height

      # sliding windows
      @dgcSlidingWindow = Metrics::MetricsSlidingWindow.new(
        @video.detection_frame_rate,
        @configReader.dm_dgc_sw_size,
        @configReader.dm_dgc_sw_decayWeights
      )
      @vsSlidingWindow = Metrics::MetricsSlidingWindow.new(
        @video.detection_frame_rate,
        @configReader.dm_vs_sw_size,
        @configReader.dm_vs_sw_decayWeights
      )
      @teSlidingWindow = Metrics::MetricsEventDistance.new(
        @video.game.events,
        @configReader.dm_te_sw_size,
        @configReader.dm_te_sw_decayWeights
      )
      @seSlidingWindow = Metrics::MetricsSlidingWindow.new(
        @video.detection_frame_rate,
        @configReader.dm_se_sw_size,
        @configReader.dm_se_sw_decayWeights
      )

      # quadrants in frame
      @metricsQuads = Metrics::MetricsQuadrants.new(@width, @height, configReader)
    end

    def calculate(frameTime, detections)
      # frameTime : time of frame
      # detections : raw scores from localization.json from khajuri

      # prob score: max of detection scores
      maxScore = get_score_max(detections)

      # det group crowding: area of detections per detectable
      # as fraction of frame area
      cumulativeArea = get_cumulative_area(detections)
      @dgcSlidingWindow.add(cumulativeArea)
      detGroupCrowding = @dgcSlidingWindow.get_decayed_average()

      # visual saliency: decay average of prob score
      @vsSlidingWindow.add(maxScore)
      visualSaliency = @vsSlidingWindow.get_decayed_average()

      # timing effectiveness: event score if detectable present in frame
      timingEffectiveness = visualSaliency > 0 ? @teSlidingWindow.get_event_score(frameTime) : 0

      # spatial position: quadrant information of detections
      intersectionQuadrants = @metricsQuads.find_intersection_quadrants(detections)

      # spatial effectiveness: derived from spatial position
      effectiveness = spatial_effectiveness(intersectionQuadrants)
      @seSlidingWindow.add(effectiveness)
      spatialEffectiveness = @seSlidingWindow.get_decayed_average()

      # view duration & persistence: calculated from visual saliency at det group level

      # Note: this is tied to schema in SingleDetectableMetric class
      detectableMetrics = {
        di: @detectableId,
        ps: maxScore,

        dgc: detGroupCrowding,
        vs: visualSaliency,
        te: timingEffectiveness,
        se: spatialEffectiveness,

        qd: intersectionQuadrants,
      }

      return detectableMetrics
    end

    def get_cumulative_area(detections)
      area = 0.0
      detections.each do |d|
        area += d[:bbox][:width] * d[:bbox][:height]
      end
      area = area / (@width * @height)
      return area
    end

    def get_score_max(detections)
      score = 0.0
      detections.each do |d|
        score = d[:score] if d[:score] > score
      end
      return score
    end

    def spatial_effectiveness(intersectionQuadrants)
      effectiveness = 0
      # for now, just add across all quadrants
      intersectionQuadrants.each do |k, v|
        effectiveness += v
      end
      effectiveness = 1 if effectiveness > 1.0
      return effectiveness
    end

  end
end
