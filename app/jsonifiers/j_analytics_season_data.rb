
module Jsonifiers
  class JAnalyticsSeasonData < Jsonifiers::JAnalytics
    def initialize(season, user)
      @season = season

      @gameIds = @season.games.pluck(:id)
      @detGroupIds = user.settings.getSeasonAnalysisDetGroupIds()
      if @detGroupIds.count == 0
        @detGroupIds = user.client.det_groups.pluck(:id)[0..5]
        user.settings.replaceSeasonAnalysisDetGroupIds(@detGroupIds)
      end
      @summaryResolutions = States::SummaryResolutions.resolutionsSeason
    end

    def to_json
      return Jsonifiers::MongoCachedPackager.new(
        @gameIds, @detGroupIds, @summaryResolutions
      ).getCachedData()
    end

  end
end
