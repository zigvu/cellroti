require 'json'
include EventsHelper

module Jsonifiers
	class JAnalyticsSeasonData < Jsonifiers::JAnalytics
		def initialize(season, client)
			@season = season
			@cacheKey = "#{@season.cache_key}/#{client.cache_key}/JAnalyticsSeasonData"

			@det_group_ids = client.det_groups.pluck(:id)
			@summaryResolution = States::SummaryResolutions.seasonResolution
		end

		def get_data_hash
			jamgmdg = Jsonifiers::JAnalyticsMultiGameMultiDetGroup.new(
				@season.games.pluck(:id), @det_group_ids, @summaryResolution)
			dataKeys, dataCounter, aggregateData = jamgmdg.get_data()

			retHash = {}
			retHash[:id] = @season.id

			# det group information
			retHash[:brand_group_map] = {}
			@det_group_ids.each do |det_group_id|
				retHash[:brand_group_map][det_group_id] = DetGroup.find(det_group_id).pretty_name
			end

			retHash[:brand_group_data_keys] = dataKeys
			retHash[:data_counter] = dataCounter
			retHash[:ndxData] = aggregateData

			return retHash
		end

	end
end
