
module Jsonifiers
	class GameDetGroupPackager < Jsonifiers::JAnalytics

		def initialize(game, detGroup, summaryResolution)
			@game = game
			@detGroup = detGroup
			@summaryResolution = summaryResolution
		end

		def self.sequenceJSON(game)
			# check for cache
			cacheKey = "#{game.cache_key}/" + 
					"#{States::SummaryResolutions.gameResolution}/GameDetGroupPackager/sequenceJSON"
			retJSON = Rails.cache.fetch(cacheKey) do 
				Jsonifiers::GameDetGroupPackager.getSequenceCounters(game).to_json
			end

			return retJSON
		end

		def self.getSequenceCounters(game)
			sequenceCounters = []
			summaryMetric = SummaryMetric
				.in(video_id: game.videos.pluck(:id))
				.in(resolution_seconds: States::SummaryResolutions.gameResolution).first

			# in case when video has been processed
			if summaryMetric != nil
				sequenceCounters << {
					video_id: summaryMetric.video_id,
					begin_count: summaryMetric.sequence_counter_begin,
					end_count: summaryMetric.sequence_counter_end
				}
				# for when we have multipe videos in a game
				# summaryMetric.each do |sm|
				# 	sequenceCounters << {
				# 		video_id: sm.video_id,
				# 		begin_count: sm.sequence_counter_begin,
				# 		end_count: sm.sequence_counter_end
				# 	}
				# end
			end
			return sequenceCounters
		end

		def dataJSON
			# check for cache
			cacheKey = "#{@game.cache_key}/#{@detGroup.cache_key}/" + 
					"#{@summaryResolution}/GameDetGroupPackager/dataJSON"
			retJSON = Rails.cache.fetch(cacheKey) do 
				getData().to_json
			end

			return retJSON
		end

		def getData
			sortedQuadrantKeys = nil
			dataArr = []

			# create cursor
			summaryMetric = SummaryMetric
				.in(video_id: @game.videos.pluck(:id), det_group_id: @detGroup.id)
				.in(resolution_seconds: @summaryResolution)

			# loop through each data point
			summaryMetric.each do |sm|
				# this will fetch SingleSummaryMetrics ordered by frame number
				sm.single_summary_metrics.each do |sdata|

					sortedQuadrantKeys = sdata.quadrants.keys.sort if sortedQuadrantKeys == nil
					quadrants = []
					sortedQuadrantKeys.each do |k|
						quadrants << sprintf("%.4f", sdata.quadrants[k])
					end

					# Note: the array ordering has to match with what we get from
					# VideoDetGroupPackager.brand_group_data_keys call
					data = [
						sdata[:resolution],
						sdata[:sequence_counter],

						#sdata[:frame_number],
						sdata[:frame_time],

						@game.id,
						@detGroup.id,

						sprintf("%.4f", sdata[:brand_effectiveness]),
						sprintf("%.4f", sdata[:det_group_crowding]),
						sprintf("%.4f", sdata[:visual_saliency]),
						sprintf("%.4f", sdata[:timing_effectiveness]),
						sprintf("%.4f", sdata[:spatial_effectiveness]),
						sdata[:detections_count],
						sprintf("%.4f", sdata[:view_duration])
					] + quadrants

					dataArr << data
				end
			end
			return dataArr
		end

		def self.brand_group_data_keys
			return [
				:averager,
				:counter,

				#:frame_number,
				:frame_time,

				:game_id,
				:det_group_id,

				:brand_effectiveness,
				:brand_group_crowding,
				:visual_saliency,
				:timing_effectiveness,
				:spatial_effectiveness,
				:detections_count,
				:view_duration,
				:q0, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8
			]
		end

	end
end
