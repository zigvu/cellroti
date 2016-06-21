require 'digest'

module Jsonifiers
  class MongoCachedPackager < Jsonifiers::JAnalytics
    def initialize(gameIds, detGroupIds, summaryResolutions)
      @gameIds = gameIds.sort
      @detGroupIds = detGroupIds.sort
      @summaryResolutions = summaryResolutions
    end

    def getCachedData
      cacheKey = getCacheKey(@gameIds, @detGroupIds, @summaryResolutions)
      seasonData = SerializedCacheStore.where(cachekey: cacheKey).first
      return seasonData.data if seasonData != nil

      # else create and store in db
      seasonData = Jsonifiers::MultiPackager.new(@gameIds, @detGroupIds, @summaryResolutions).getData()

      # save to database for future reference
      SerializedCacheStore.create(
        cachekey: cacheKey,
        game_ids: @gameIds,
        det_group_ids: @detGroupIds,
        summary_resolutions: @summaryResolutions,
        data: seasonData)

      return seasonData
    end

    def getCacheKey(gameIds, detGroupIds, summaryResolutions)
      md5 = Digest::MD5.new

      gameIds.each do |gameId|
        md5 << "#{Game.find(gameId).cache_key}"
      end
      detGroupIds.each do |detGroupId|
        md5 << "#{DetGroup.find(detGroupId).cache_key}"
      end

      md5 << "#{summaryResolutions}"

      return md5.hexdigest
    end

  end
end
