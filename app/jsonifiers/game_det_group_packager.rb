
module Jsonifiers
  class GameDetGroupPackager < Jsonifiers::JAnalytics

    def initialize(game, detGroup, summaryResolutions)
      @game = game
      @detGroup = detGroup
      @summaryResolutions = summaryResolutions
      @cacheKey = "#{@game.cache_key}/#{@detGroup.cache_key}/" +
          "#{@summaryResolutions}/GameDetGroupPackager"
    end

    def to_json
      Rails.cache.fetch(@cacheKey) do
        getData().to_json
      end
    end

    def getData
      sortedQuadrantKeys = nil
      dataArr = []

      # create cursor
      summaryMetric = SummaryMetric
        .in(video_id: @game.videos.pluck(:id))
        .where(det_group_id: @detGroup.id)
        .in(resolution_seconds: @summaryResolutions)

      # loop through each data point
      summaryMetric.each do |sm|
        # this will fetch SingleSummaryMetrics ordered by frame number
        sm.single_summary_metrics.each do |sdata|

          sortedQuadrantKeys = sdata.quadrants.keys.sort if sortedQuadrantKeys == nil
          quadrants = []
          sortedQuadrantKeys.each do |k|
            quadrants << sprintf("%.4f", sdata.quadrants[k])
          end

          # Note: the array ordering has to match with what we get from
          # GameDetGroupPackager.brand_group_data_keys call
          data = [
            sdata[:resolution], # note: this is called averager below
            sdata[:sequence_counter], # note: this is called counter below

            #sdata[:frame_number],
            sdata[:extracted_frame_number],
            sdata[:extracted_frame_score],
            sdata[:frame_time],

            @game.id,
            @detGroup.id,

            sprintf("%.4f", sdata[:brand_effectiveness]),
            sprintf("%.4f", sdata[:det_group_crowding]),
            sprintf("%.4f", sdata[:visual_saliency]),
            sprintf("%.4f", sdata[:timing_effectiveness]),
            sprintf("%.4f", sdata[:spatial_effectiveness]),
            sprintf("%.4f", sdata[:view_duration]),
            sprintf("%.4f", sdata[:view_persistence])
          ] + quadrants

          dataArr << data
        end
      end
      return dataArr
    end

    def self.brand_group_data_keys
      return [
        :averager,
        :counter,

        #:frame_number,
        :extracted_frame_number,
        :extracted_frame_score,
        :frame_time,

        :game_id,
        :det_group_id,

        :brand_effectiveness,
        :brand_group_crowding,
        :visual_saliency,
        :timing_effectiveness,
        :spatial_effectiveness,
        :view_duration,
        :view_persistence,

        :q0, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8
      ]
    end

  end
end
