require 'json'
include EventsHelper

module Jsonifiers
	class JAnalyticsSingleGameSingleDetGroup < Jsonifiers::JAnalytics
		attr_accessor :cacheKey

		def initialize(game, detGroup, summaryResolution)
			@game = game
			@detGroup = detGroup
			@summaryResolution = summaryResolution
			@cacheKey = "#{@game.cache_key}/#{@detGroup.cache_key}/#{@summaryResolution}/JAnalyticsSingleGameSingleDetGroup"
		end

		def getGameEvents
			retArr = []
			@game.events.each do |event|
				retArr << {
					id: event.event_type_id, 
					#time: milliseconds_to_prettyprint(event.event_time)}
					time: event.event_time
				}
			end
			retArr.sort_by! {|h| h[:time]}
			return retArr
		end
		
		def self.brand_group_data_keys
			return [
				:brand_effectiveness,   # 0
				:brand_group_crowding,  # 1
				:visual_saliency,       # 2
				:timing_effectiveness,  # 3
				:spatial_effectiveness, # 4
				:detections_count,      # 5
				:view_duration,         # 6
				:q0, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8 # quadrants 
			]
		end

		# Note: do NOT save JSON in cache - save hash itself
		def getGameData
			raise 'Need a cache key for JAnalyticsSingleGameSingleDetGroup class' if @cacheKey == nil
			retJSON = Rails.cache.fetch(@cacheKey) do 
				getGameData_NonChached()
			end
		end

		# Note: do NOT save JSON in cache - save hash itself
		def getGameData_NonChached
			# return objects
			sortedTimeKeys = []
			dataHash = {}

			# create cursor
			summaryMetric = SummaryMetric
				.in(video_id: @game.videos.pluck(:id), det_group_id: @detGroup.id)
				.where(resolution_seconds: @summaryResolution)

			# loop through each data point
			summaryMetric.each do |sm|
				sm.single_summary_metrics.each do |sdata|

					quadrants = []
					#qdata = JSON.parse()
					sdata.quadrants.keys.sort.each do |k|
						#quadrants << sprintf("%.4f", sdata.quadrants[k])
						# TODO TODO TODO TODO TODO TODO TODO
						# TODO TODO TODO TODO TODO TODO TODO
						quadrants << sprintf("%.4f", sdata.quadrants[k] * 4000) # <---- TODO: remove
					end

					# Note: the array ordering has to match with what we get from
					# JAnalyticsSingleGameData.brand_group_data_keys call
					data = [
						sprintf("%.4f", sdata[:brand_effectiveness]),   # 0
						sprintf("%.4f", sdata[:det_group_crowding]),    # 1
						sprintf("%.4f", sdata[:visual_saliency]),       # 2
						sprintf("%.4f", sdata[:timing_effectiveness]),  # 3
						sprintf("%.4f", sdata[:spatial_effectiveness]), # 4
						sdata[:detections_count],                       # 5
						# TODO TODO TODO TODO TODO TODO TODO
						# TODO TODO TODO TODO TODO TODO TODO
						sdata[:detections_count] + 1,                   # 6   <---- TODO: change to proper view duration
					] + quadrants

					dataHash[sdata[:frame_time]] = data
					sortedTimeKeys << sdata[:frame_time]
				end
			end
			
			sortedTimeKeys.sort!
			
			# Note: do NOT save JSON in cache - save hash itself
			return {dataHash: dataHash, sortedTimeKeys: sortedTimeKeys}
		end

	end
end
