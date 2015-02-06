require 'json'
require 'csv'

include EventsHelper

module Jsonifiers
	class JAnalyticsSeasonData < Jsonifiers::JAnalytics
		def initialize(season, client)
			@season = season
			@cacheKey = "#{@season.cache_key}/#{client.cache_key}/JAnalyticsSeasonData"

			@det_group_ids = client.det_groups.pluck(:id)
			@summaryResolution = States::SummaryResolutions.seasonResolution
		end

		# TODO: REMOVE
		def get_n_elem_array(arr, n)
			newArr = []
			arr.each do |a|
				newArr << a
				break if newArr.count >= n
			end
			return newArr
		end

		def get_data_hash
			gameIds = get_n_elem_array(@season.games.pluck(:id), 64)
			# jamgmdg = Jsonifiers::JAnalyticsMultiGameMultiDetGroup.new(
			# 	@season.games.pluck(:id), @det_group_ids, @summaryResolution)
			#dataKeys, dataCounter, aggregateData = jamgmdg.get_data()

			# TODO: REMOVE
			jamgmdg = Jsonifiers::JAnalyticsMultiGameMultiDetGroup.new(
				gameIds, @det_group_ids, @summaryResolution)
			dataKeys, dataCounter, aggregateData = jamgmdg.get_data_new()

			retHash = {}
			retHash[:id] = @season.id

			# det group information
			retHash[:brand_group_map] = {}
			@det_group_ids.each do |det_group_id|
				retHash[:brand_group_map][det_group_id] = DetGroup.find(det_group_id).pretty_name
			end

			retHash[:brand_group_data_keys] = dataKeys
			# TODO: REMOVE
			#retHash[:brand_group_data_keys] = get_n_elem_array(dataKeys, 4)

			retHash[:data_counter] = dataCounter
			retHash[:ndxData] = aggregateData

			return retHash
		end

		def get_ndx_csv(filename)
			ndxData = get_data_hash()[:ndxData]

			CSV.open(filename, "w") do |csv|
				ndxData.each do |d|
					csv << d.flatten
				end
			end
			return true
		end

		def array_averager(inputArr)
			intervals = [5, 10, 30, 100]
			# intervals = [2, 3]

			interArr = {}
			intervals.each do |i|
				interArr[i] = []
			end

			outputArr = []
			inputArr.each do |inp|
				outputArr << [1] + inp
				intervals.each do |i|
					interArr[i] << inp
					# if size reached, dump into outputArr
					if interArr[i].count == i
						outputArr << [i] + getMax(interArr[i])
						interArr[i] = []
					end
				end
			end
			# no need to write the last batch
			return outputArr
		end

		def getMax(inputArr)
			outputArr = []
			for i in 0..(inputArr[0].count - 1)
				outputArr << inputArr.map{|a| a[i]}.max
			end
			return outputArr
		end

	end
end
