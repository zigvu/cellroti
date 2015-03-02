
module Jsonifiers
	class JAnalyticsSeasonData < Jsonifiers::JAnalytics
		def initialize(season, client)
			@season = season
			
			@gameIds = @season.games.pluck(:id)
			@detGroupIds = client.det_groups.pluck(:id)
			@summaryResolution = States::SummaryResolutions.resolutionsSeason
			#@summaryResolution = [1,10]
		end

		def to_json
			return Jsonifiers::MongoCachedPackager.new(@gameIds, @detGroupIds, @summaryResolution).getCachedData()
		end

	end
end
