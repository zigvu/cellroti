module Jsonifiers
	class GameEventsPackager < Jsonifiers::JAnalytics
		def initialize(game, summaryResolution)
			@game = game
			@summaryResolution = summaryResolution
		end

		def eventsJSON
			# check for cache
			retJSON = {game_events: getEvents()}.to_json
			return retJSON
		end

		def getEvents
			gameEvents = {}
			sortedTimeKeys = SummaryMetric
					.in(video_id: @game.videos.pluck(:id))
					.in(resolution_seconds: @summaryResolution)
				.first.single_summary_metrics
					.pluck(:frame_time).sort

			# align event times with frame times so that counter calculations are correct
			timeKeyIdx = 0
			@game.events.order(:event_time).each do |gameEvent|
				while ((sortedTimeKeys[timeKeyIdx] < gameEvent.event_time) and 
					(timeKeyIdx < (sortedTimeKeys.count - 1)))
					timeKeyIdx += 1
				end
				gameEvents[sortedTimeKeys[timeKeyIdx]] = gameEvent.event_type_id
			end

			return gameEvents
		end

	end
end