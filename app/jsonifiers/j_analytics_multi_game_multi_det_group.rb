require 'digest'

module Jsonifiers
	class JAnalyticsMultiGameMultiDetGroup < Jsonifiers::JAnalytics
		attr_accessor :cacheKey

		def initialize(gameIds, detGroupIds, summaryResolution)
			@gameIds = gameIds.sort
			@detGroupIds = detGroupIds.sort
			@summaryResolution = summaryResolution

			# check for caches
			md5 = Digest::MD5.new

			# create single game single det group objects
			@singleGameSingleDetGroups = {}
			@gameIds.each do |gameId|
				@singleGameSingleDetGroups[gameId] = {}
				@detGroupIds.each do |detGroupId|
					jd = Jsonifiers::JAnalyticsSingleGameSingleDetGroup.new(
							Game.find(gameId), DetGroup.find(detGroupId), @summaryResolution)
					@singleGameSingleDetGroups[gameId][detGroupId] = jd
					# also compute md5 hash
					md5 << jd.cacheKey
				end
			end

			@cacheKey = md5.hexdigest
		end

		def to_json
			return getSeasonData()
		end

		def getSeasonData
			# check to see if we already have serialized computed results in mongo
			seasonData = SerializedCacheStore.where(cachekey: @cacheKey).first
			return seasonData.data if seasonData != nil

			# if no data exists
			data = getSeasonData_NonChached()

			# save to database for future reference
			SerializedCacheStore.create(
				cachekey: @cacheKey,
				game_ids: @gameIds,
				det_group_ids: @detGroupIds,
				summary_resolution: @summaryResolution,
				data: data)

			return data
		end

		def getSeasonData_NonChached
			# add to data keys
			dataKeys = [:averager, :counter, :game_id, :det_group_id] + 
				JAnalyticsSingleGameSingleDetGroup.brand_group_data_keys

			# averager storage
			averagerIntervals = Jsonifiers::JAnalyticsArrayAverager.intervals
			averagerIntervalsHash = {}
			@detGroupIds.each do |detGroupId|
				averagerIntervalsHash[detGroupId] = {}
				averagerIntervals.each do |interval|
					averagerIntervalsHash[detGroupId][interval] = Jsonifiers::JAnalyticsArrayAverager.new(interval)
				end
			end

			aggregateData = []
			gameDemarcations = []

			counter = 0
			gameBeginCounter = 0
			@gameIds.each do |gameId|
				# save counter demarcations
				gameBeginCounter = counter

				# get data for single game
				gameDetGroupData = {}
				sortedTimeKeys = nil
				@detGroupIds.each do |detGroupId|
					gameData = @singleGameSingleDetGroups[gameId][detGroupId].getGameData()
					gameDetGroupData[detGroupId] = gameData[:dataHash]
					sortedTimeKeys = gameData[:sortedTimeKeys]
				end
				
				# create multi-game counter and averager
				sortedTimeKeys.each do |tKey|
					@detGroupIds.each do |detGroupId|
						dataLine = gameDetGroupData[detGroupId][tKey]

						# put in the original non-averaged data
						aggregateData << [1, counter, gameId, detGroupId] + dataLine

						# put in data for each averager interval
						averagerIntervals.each do |interval|
							averagerIntervalsHash[detGroupId][interval].addData(dataLine)
						end

						# if size reached, dump into output array
						averagerIntervals.each do |interval|
							if averagerIntervalsHash[detGroupId][interval].isFull?
								aggregateData << [interval, counter, gameId, detGroupId] + \
									averagerIntervalsHash[detGroupId][interval].getData()
								averagerIntervalsHash[detGroupId][interval].reset()
							end
						end

					end
					counter += 1
				end

				gameDemarcations << { game_id: gameId, begin_count: gameBeginCounter, end_count: counter }
			end

			# add in some extra information in JSON
			retHash = {}

			# det group information
			retHash[:brand_group_map] = {}
			@detGroupIds.each do |detGroupId|
				retHash[:brand_group_map][detGroupId] = DetGroup.find(detGroupId).pretty_name
			end

			retHash[:brand_group_data_keys] = dataKeys
			retHash[:game_demarcations] = gameDemarcations
			retHash[:ndx_data] = aggregateData

			return retHash.to_json
		end

	end
end
