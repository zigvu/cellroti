
module Jsonifiers
  class JAnalyticsDiscoverSummary < Jsonifiers::JAnalytics
    def initialize(filter)
      @filter = filter
    end

    def to_json
      return getData().to_json
    end

    def getData
      brandGroupMap = ::DetGroup.where(id: @filter.brand_group_ids)
        .pluck(:id, :name).to_h
      streamMap = ::Stream.in(kheer_stream_id: @filter.kheer_stream_ids)
        .pluck(:kheer_stream_id, :name).to_h
      eventMap = {'1' => "Goal", '2' => "Penalty", '3' => "Red Card", '4' => "Yellow Card"}
      return {
        dates: {
          min_begin_date: @filter.min_begin_date.to_f,
          max_end_date: @filter.max_end_date.to_f,
          cal_begin_date: @filter.cal_begin_date.to_f,
          cal_end_date: @filter.cal_end_date.to_f
        },
        brand_group_map: brandGroupMap,
        stream_map: streamMap,
        event_map: eventMap
      }
    end

  end
end
