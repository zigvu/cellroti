require 'json'
include EventsHelper

module Jsonifiers
	class JAnalyticsMultiGameMultiDetGroup < Jsonifiers::JAnalytics
		def initialize(gameIds, detGroupIds, summaryResolution)
			@gameIds = gameIds
			@detGroupIds = detGroupIds
			@summaryResolution = summaryResolution
		end

		def getMax(inputArr)
			outputArr = []
			for i in 0..(inputArr[0].count - 1)
				outputArr << inputArr.map{|a| a[i]}.max
			end
			return outputArr
		end

		def get_data_new
			# new data keys for ndx cross filter
			dataKeys = [:averager, :counter, :game_id, :bg_id] + JAnalyticsSingleGameSingleDetGroup.brand_group_data_keys

			# averager storage
			averagerIntervals = [5, 10, 30, 100]
			averagerIntervalsHash = {}
			averagerIntervals.each do |i|
				averagerIntervalsHash[i] = {}
				@detGroupIds.each do |detGroupId|
					averagerIntervalsHash[i][detGroupId] = []
				end
			end

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
						dataLine = gameDetGroupData[detGroupId][tKey].flatten

						aggregateData << [1, counter, gameId, detGroupId] + dataLine
						averagerIntervals.each do |i|
							averagerIntervalsHash[i][detGroupId] << dataLine
							# if size reached, dump into outputArr
							if averagerIntervalsHash[i][detGroupId].count == i
								aggregateData << [i, counter, gameId, detGroupId] + getMax(averagerIntervalsHash[i][detGroupId])
								averagerIntervalsHash[i][detGroupId] = []
							end
						end
					end
					dataCount += 1
					counter += 1
				end

				dataCounter << { game_id: gameId, data_count: dataCount }
			end
			return dataKeys, dataCounter, aggregateData
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
