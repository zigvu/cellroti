
module Jsonifiers
  class JAnalyticsDiscoverData < Jsonifiers::JAnalytics
    def initialize(filter)
      @filter = filter
    end

    def to_json
      # return Jsonifiers::MongoCachedPackager.new(
      #   @gameIds, @detGroupIds, @summaryResolutions
      # ).getCachedData()
      bd = @filter.cal_begin_date
      eventData = [{date: Metrics::DateManipulator.new(bd).afterSec(10).to_f, name: 'Goal'}]
      _, ndxData = getNdxData()

      return {
        brand_group_data_keys: Jsonifiers::SummaryBundlePackager.brand_group_data_keys,
        ndx_data: ndxData,
        events: eventData,
      }.to_json
    end

    def getNdxData
      beginDate = @filter.cal_begin_date
      endDate = @filter.cal_end_date

      concatCacheKeys = ""
      ndxData = []
      @filter.kheer_stream_ids.sort.each do |ksId|
        @filter.brand_group_ids.sort.each do |bgId|
          sbp = Jsonifiers::SummaryBundlePackager.new(ksId, bgId, beginDate, endDate)
          concatCacheKeys += sbp.cacheKey
          ndxData += sbp.cachedData[:data]
        end
      end

      return concatCacheKeys, ndxData
    end

  end
end
