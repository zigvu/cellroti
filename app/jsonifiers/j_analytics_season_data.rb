
module Jsonifiers
	class JAnalyticsSeasonData < Jsonifiers::JAnalytics
		def initialize(season, client)
			@season = season
			
			@detGroupIds = client.det_groups.pluck(:id)
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

		def to_json
			jd = Jsonifiers::JAnalyticsMultiGameMultiDetGroup.new(
				@season.games.pluck(:id), @detGroupIds, @summaryResolution)

			# TODO: REMOVE
			# gameIds = get_n_elem_array(@season.games.pluck(:id), 64)
			# jd = Jsonifiers::JAnalyticsMultiGameMultiDetGroup.new(
			# 	gameIds, @detGroupIds, @summaryResolution)

			return jd.to_json()
		end

	end
end
