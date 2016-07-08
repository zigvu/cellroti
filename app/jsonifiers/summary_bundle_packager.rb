module Jsonifiers
  class SummaryBundlePackager < Jsonifiers::JAnalytics
    attr_accessor :cacheKey

    def initialize(kheerStreamId, detGroupId, beginDate, endDate)
      @stream = ::Stream.where(kheer_stream_id: kheerStreamId).first
      @detGroup = ::DetGroup.find(detGroupId)
      @bundle = States::BundleResolutions.getBundle(beginDate, endDate)
      @bundleDates = States::BundleResolutions.getBundleDates(beginDate, endDate)
      @cacheKey = "#{@stream.cache_key}/#{@detGroup.cache_key}/" +
          "#{@bundle}/#{@bundleDates}/SummaryBundlePackager"
    end

    def cachedData
      # Rails.cache.fetch(@cacheKey) do
      #   getData()
      # end
      getData()
    end

    def getData
      sortedQuadrantKeys = nil
      dataArr = []

      # create cursor - note order is important because of multi-index
      summaryMetric = SummaryMetric
        .where(stream_id: @stream.id)
        .where(det_group_id: @detGroup.id)
        .where(date_bundle: @bundle)
        .in(begin_date: @bundleDates)

      # loop through each data point
      summaryMetric.each do |sm|
        firstSsmTime = nil
        smBeginDayManp = Metrics::DateManipulator.new(sm.begin_date)

        # this will fetch SingleSummaryMetrics ordered by stream_frame_time
        sm.single_summary_metrics.each do |sdata|
          firstSsmTime ||= sdata.stream_frame_time
          curSsmDate = smBeginDayManp.afterMs(sdata.stream_frame_time - firstSsmTime)

          sortedQuadrantKeys ||= sdata.quadrants.keys.sort
          quadrants = []
          sortedQuadrantKeys.each do |k|
            quadrants << sprintf("%.4f", sdata.quadrants[k])
          end

          # Note: the array ordering has to match with what we get from
          # SummaryBundlePackager.brand_group_data_keys call
          data = [
            sprintf("%.4f", curSsmDate.to_f),
            @stream.kheer_stream_id,
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
      return {
        data: dataArr,
        bundle: @bundle,
        date_bundles: @bundleDates
      }
    end

    def self.brand_group_data_keys
      return [
        :date,

        :kheer_stream_id,
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
