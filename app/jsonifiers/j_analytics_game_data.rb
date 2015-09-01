
module Jsonifiers
	class JAnalyticsGameData < Jsonifiers::JAnalytics
		def initialize(game, client)
			@game = game

			@detGroupIds = client.det_groups.pluck(:id)
			@summaryResolutions = States::SummaryResolutions.resolutionsGame
		end

		def to_json
			return Jsonifiers::MongoCachedPackager.new(
				[@game.id], @detGroupIds, @summaryResolutions
			).getCachedData()
		end

	end
end
