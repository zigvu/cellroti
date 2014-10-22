require 'json'
include EventsHelper

module Jsonifiers
	class JAnalyticsGameData < Jsonifiers::JAnalytics
		def initialize(game, client)
			@game = game
			@det_group_ids = client.det_groups.pluck(:id)
			@summaryTableName = States::SummaryResolutions.new.resolutions[
				States::SummaryResolutions.gameResolution][:tname]
		end

		def get_data_hash
			retHash = {}
			retHash[:id] = @game.id
			retHash[:brand_group_data_keys] = Jsonifiers::JAnalyticsGameData.brand_group_data_keys

			retHash[:events] = Jsonifiers::JAnalyticsGameData.getGameEvents(@game)

			retHash[:brand_group_data] = Jsonifiers::JAnalyticsGameData.getGameSummaryData(
				@game, @summaryTableName, @det_group_ids)

			return retHash
		end

		def self.getGameEvents(game)
			retArr = []
			game.events.each do |event|
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
				:quadrants              # 6
			]
		end

		def self.getGameSummaryData(game, summaryTableName, det_group_ids)
			retArr = []
			game.send(summaryTableName).where(det_group_id: det_group_ids).each do |sdata|
				quadrants = []
				qdata = JSON.parse(sdata.quadrants)
				qdata.keys.sort.each do |k|
					quadrants << sprintf("%.4f", qdata[k])
				end

				data = [
					sprintf("%.4f", sdata[:brand_effectiveness]),   # 0
					sprintf("%.4f", sdata[:det_group_crowding]),    # 1
					sprintf("%.4f", sdata[:visual_saliency]),       # 2
					sprintf("%.4f", sdata[:timing_effectiveness]),  # 3
					sprintf("%.4f", sdata[:spatial_effectiveness]), # 4
					sdata[:detections_count],                       # 5
					quadrants                                       # 6
				]

				dataIdx = retArr.find_index {|d| d[:time] == sdata[:frame_time]}
				if dataIdx == nil
					retArr << {
						time: sdata[:frame_time], 
						bgData: []
					}
					dataIdx = retArr.find_index {|d| d[:time] == sdata[:frame_time]}
				end
				retArr[dataIdx][:bgData] << {
					sdata.det_group_id => data
				}
			end
			retArr.sort_by! {|h| h[:time]}
			return retArr
		end

	end
end
