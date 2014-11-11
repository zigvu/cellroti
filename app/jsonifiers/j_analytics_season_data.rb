require 'json'
include EventsHelper

module Jsonifiers
	class JAnalyticsSeasonData < Jsonifiers::JAnalytics
		def initialize(season, client)
			@season = season
			@det_group_ids = client.det_groups.pluck(:id)
			@summaryResolution = States::SummaryResolutions.seasonResolution
			@summaryTableName = States::SummaryResolutions.new.resolutions[@summaryResolution][:tname]
		end

		def get_data_hash
			retHash = {}
			retHash[:id] = @season.id

			# det group information
			retHash[:brand_groups] = []
			@det_group_ids.each do |det_group_id|
				retHash[:brand_groups] << {
					id: det_group_id,
					name: DetGroup.find(det_group_id).name
				}
			end

			# game data
			retHash[:brand_group_data_keys] = Jsonifiers::JAnalyticsGameData.brand_group_data_keys
			retHash[:games] = []
			@season.games.includes(:events).each do |game|
				gameHash = {}
				gameHash[:id] = game.id

				gameHash[:events] = Jsonifiers::JAnalyticsGameData.getGameEvents(game)
				gameHash[:gameData] = Jsonifiers::JAnalyticsGameData.getGameSummaryData(
					game, @summaryResolution, @det_group_ids)
				
				retHash[:games] << gameHash
			end

			return retHash
		end

		def get_data_hash2
			retHash = {}
			retHash[:id] = @season.id

			# det group information
			retHash[:brand_groups] = []
			@det_group_ids.each do |det_group_id|
				retHash[:brand_groups] << {
					id: det_group_id,
					name: DetGroup.find(det_group_id).name
				}
			end

			# game data
			retHash[:brand_group_data_keys] = Jsonifiers::JAnalyticsGameData.brand_group_data_keys
			retHash[:games] = []
			@season.games.includes(@summaryTableName.to_sym, :events).each do |game|
				gameHash = {}
				gameHash[:id] = game.id

				gameHash[:events] = Jsonifiers::JAnalyticsGameData.getGameEvents(game)
				gameHash[:gameData] = Jsonifiers::JAnalyticsGameData.getGameSummaryData2(
					game, @summaryTableName, @det_group_ids)
				
				retHash[:games] << gameHash
			end

			return retHash
		end

	end
end
