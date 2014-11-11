require 'json'
include EventsHelper

module Jsonifiers
	class JAnalyticsGameData < Jsonifiers::JAnalytics
		def initialize(game, client)
			@game = game
			@det_group_ids = client.det_groups.pluck(:id)
			@summaryResolution = States::SummaryResolutions.gameResolution
		end

		def get_data_hash
			retHash = {}
			retHash[:id] = @game.id
			retHash[:brand_group_data_keys] = Jsonifiers::JAnalyticsGameData.brand_group_data_keys

			retHash[:events] = Jsonifiers::JAnalyticsGameData.getGameEvents(@game)

			retHash[:brand_group_data] = Jsonifiers::JAnalyticsGameData.getGameSummaryData(
				@game, @summaryResolution, @det_group_ids)

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
				:view_duration,         # 6
				:quadrants              # 7
			]
		end

		def self.getGameSummaryData(game, summaryResolution, det_group_ids)
			retArr = []
			summaryMetric = SummaryMetric
				.in(video_id: game.videos.pluck(:id), det_group_id: det_group_ids)
				.where(resolution_seconds: summaryResolution)
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

					data = [
						sprintf("%.4f", sdata[:brand_effectiveness]),   # 0
						sprintf("%.4f", sdata[:det_group_crowding]),    # 1
						sprintf("%.4f", sdata[:visual_saliency]),       # 2
						sprintf("%.4f", sdata[:timing_effectiveness]),  # 3
						sprintf("%.4f", sdata[:spatial_effectiveness]), # 4
						sdata[:detections_count],                       # 5
						# TODO TODO TODO TODO TODO TODO TODO
						# TODO TODO TODO TODO TODO TODO TODO
						sdata[:detections_count],                       # 6   <---- TODO: change to proper view duration
						quadrants                                       # 7
					]

					# save to right index - if none exist, create new entry
					dataIdx = retArr.find_index {|d| d[:time] == sdata[:frame_time]}
					if dataIdx == nil
						retArr << {
							time: sdata[:frame_time], 
							bgData: []
						}
						dataIdx = retArr.find_index {|d| d[:time] == sdata[:frame_time]}
					end
					retArr[dataIdx][:bgData] << {
						sm.det_group_id => data
					}
				end
			end
			retArr.sort_by! {|h| h[:time]}
			return retArr
		end

		def self.getGameSummaryData2(game, summaryTableName, det_group_ids)
			retArr = []
			game.send(summaryTableName).where(det_group_id: det_group_ids).each do |sdata|
				quadrants = []
				qdata = JSON.parse(sdata.quadrants)
				qdata.keys.sort.each do |k|
					#quadrants << sprintf("%.4f", qdata[k])
					# TODO TODO TODO TODO TODO TODO TODO
					# TODO TODO TODO TODO TODO TODO TODO
					quadrants << sprintf("%.4f", qdata[k] * 4000) # <---- TODO: remove
				end

				data = [
					sprintf("%.4f", sdata[:brand_effectiveness]),   # 0
					sprintf("%.4f", sdata[:det_group_crowding]),    # 1
					sprintf("%.4f", sdata[:visual_saliency]),       # 2
					sprintf("%.4f", sdata[:timing_effectiveness]),  # 3
					sprintf("%.4f", sdata[:spatial_effectiveness]), # 4
					sdata[:detections_count],                       # 5
					# TODO TODO TODO TODO TODO TODO TODO
					# TODO TODO TODO TODO TODO TODO TODO
					sdata[:detections_count],                       # 6   <---- TODO: change to proper view duration
					quadrants                                       # 7
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
