
module Jsonifiers
	class JAnalyticsGameData < Jsonifiers::JAnalytics
		def initialize(game, user)
			@game = game

			@detGroupIds = user.settings.getSeasonAnalysisDetGroupIds()
			@summaryResolutions = States::SummaryResolutions.resolutionsGame
		end

		def to_json
			return Jsonifiers::MongoCachedPackager.new(
				[@game.id], @detGroupIds, @summaryResolutions
			).getCachedData()
		end

	end
end
