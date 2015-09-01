
module Jsonifiers
	class JAnalyticsSeasonData < Jsonifiers::JAnalytics
		def initialize(season, client)
			@season = season
			
			@gameIds = @season.games.pluck(:id)
			@detGroupIds = client.det_groups.pluck(:id)
			@summaryResolutions = States::SummaryResolutions.resolutionsSeason
		end

		def to_json
			return Jsonifiers::MongoCachedPackager.new(
				@gameIds, @detGroupIds, @summaryResolutions
			).getCachedData()
		end

	end
end
