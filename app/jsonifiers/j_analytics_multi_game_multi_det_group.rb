require 'json'
include EventsHelper

module Jsonifiers
	class JAnalyticsMultiGameMultiDetGroup < Jsonifiers::JAnalytics
		def initialize(gameIds, detGroupIds, summaryResolution)
			@gameIds = gameIds
			@detGroupIds = detGroupIds
			@summaryResolution = summaryResolution
		end

		def get_data
			# new data keys for ndx cross filter
			dataKeys = [:counter, :game_id, :bg_id] + JAnalyticsSingleGameSingleDetGroup.brand_group_data_keys

			aggregateData = []
			dataCounter = []
			counter = 0
			@gameIds.sort.each do |gameId|
				# save counter demarcations
				dataCount = 0

				# get data for single game
				game = Game.find(gameId)
				gameDetGroupData = {}
				@detGroupIds.each do |detGroupId|
					gameDetGroupData[detGroupId] = Jsonifiers::JAnalyticsSingleGameSingleDetGroup.new(
						game, DetGroup.find(detGroupId), @summaryResolution).getGameData()
				end
				
				# inject additional variables for each time stamp
				timeKeys = gameDetGroupData[@detGroupIds.first].keys
				timeKeys.sort.each do |tKey|
					@detGroupIds.each do |detGroupId|
						aggregateData << [counter, gameId, detGroupId] + gameDetGroupData[detGroupId][tKey]
					end
					dataCount += 1
					counter += 1
				end

				dataCounter << { game_id: gameId, data_count: dataCount }
			end
			return dataKeys, dataCounter, aggregateData
		end


	end
end
