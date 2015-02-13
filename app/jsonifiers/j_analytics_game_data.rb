
module Jsonifiers
	class JAnalyticsGameData < Jsonifiers::JAnalytics
		def initialize(game, client)
			@game = game

			@detGroupIds = client.det_groups.pluck(:id)
			@summaryResolution = States::SummaryResolutions.gameResolution
		end

		def to_json
			jd = Jsonifiers::JAnalyticsMultiGameMultiDetGroup.new(
				[@game.id], @detGroupIds, @summaryResolution)

			return jd.to_json()
		end

	end
end
