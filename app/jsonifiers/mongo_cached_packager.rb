require 'digest'

module Jsonifiers
	class MongoCachedPackager < Jsonifiers::JAnalytics
		def initialize(gameIds, detGroupIds, summaryResolution)
			@gameIds = gameIds.sort
			@detGroupIds = detGroupIds.sort
			@summaryResolution = summaryResolution
		end

		def getCachedData
			cacheKey = getCacheKey(@gameIds, @detGroupIds, @summaryResolution)
			seasonData = SerializedCacheStore.where(cachekey: cacheKey).first
			return seasonData.data if seasonData != nil

			# else create and store in db
			seasonData = Jsonifiers::MultiPackager.new(@gameIds, @detGroupIds, @summaryResolution).getData()

			# save to database for future reference
			SerializedCacheStore.create(
				cachekey: cacheKey,
				game_ids: @gameIds,
				det_group_ids: @detGroupIds,
				summary_resolution: @summaryResolution,
				data: seasonData)

			return seasonData
		end

		def getCacheKey(gameIds, detGroupIds, summaryResolution)
			md5 = Digest::MD5.new

			gameIds.each do |gameId|
				md5 << "#{Game.find(gameId).cache_key}"
			end
			detGroupIds.each do |detGroupId|
				md5 << "#{DetGroup.find(detGroupId).cache_key}"
			end

			md5 << "#{summaryResolution}"

			return md5.hexdigest
		end

	end
end
