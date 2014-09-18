require 'json'
include EventsHelper

module Jsonifiers
	class JAnalyticsSeasonData < Jsonifiers::JAnalytics
		def initialize(season, client)
			@season = season
			@det_group_ids = client.det_groups.pluck(:id)
			@summaryTableName = States::SummaryResolutions.new.resolutions[
				States::SummaryResolutions.seasonResolution][:tname]
		end

		def get_data_hash
			retHash = {}
			retHash[:id] = @season.id
			retHash[:brand_group_data_keys] = Jsonifiers::JAnalyticsGameData.brand_group_data_keys
			
			retHash[:games] = []
			@season.games.includes(@summaryTableName.to_sym, :events).each do |game|
				gameHash = {}
				gameHash[:id] = game.id

				gameHash[:events] = Jsonifiers::JAnalyticsGameData.getGameEvents(game)
				gameHash[:summary_data] = Jsonifiers::JAnalyticsGameData.getGameSummaryData(
					game, @summaryTableName, @det_group_ids)
				
				retHash[:games] << gameHash
			end

			return retHash
		end

	end
end
