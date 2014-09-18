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
					event_type_id: event.event_type_id, 
					event_time: milliseconds_to_prettyprint(event.event_time)}
			end
			return retArr
		end
		
		def self.brand_group_data_keys
			return [
				:brand_group_crowding,  # 0
				:visual_saliency,       # 1
				:timing_effectiveness,  # 2
				:spatial_effectiveness, # 3
				:detections_count,      # 4
				:quadrants              # 5
			]
		end

		def self.getGameSummaryData(game, summaryTableName, det_group_ids)
			retArr = []
			game.send(summaryTableName).where(det_group_id: det_group_ids).each do |sdata|
				quadrants = {}
				JSON.parse(sdata.quadrants).each do |k,v|
					quadrants[k] = sprintf("%.4f", v)
				end

				data = [
					sprintf("%.4f", sdata[:det_group_crowding]),    # 0
					sprintf("%.4f", sdata[:visual_saliency]),       # 1
					sprintf("%.4f", sdata[:timing_effectiveness]),  # 2
					sprintf("%.4f", sdata[:spatial_effectiveness]), # 3
					sdata[:detections_count],                       # 4
					quadrants                                       # 5
				]
				
				sdataHash = {
					id: sdata.id, 
					time: milliseconds_to_prettyprint(sdata[:frame_time]),
					data: data
				}
				retArr << sdataHash
			end
			return retArr
		end
		
	end
end
