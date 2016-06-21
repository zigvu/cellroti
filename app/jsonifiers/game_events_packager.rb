module Jsonifiers
  class GameEventsPackager < Jsonifiers::JAnalytics
    def initialize(game, summaryResolutions)
      @game = game
      @summaryResolutions = summaryResolutions
      @cacheKey = "#{@game.cache_key}/#{summaryResolutions}/GameEventsPackager"
    end

    def to_json
      Rails.cache.fetch(@cacheKey) do
        {game_events: getEvents()}.to_json
      end
    end

    def getEvents
      gameEvents = []
      frameTimeSequenceCounter = SummaryMetric
          .in(video_id: @game.videos.pluck(:id))
          .in(resolution_seconds: @summaryResolutions)
        .first.single_summary_metrics.order_by(frame_time: :asc)
          .pluck(:frame_time, :sequence_counter)

      sortedTimes = frameTimeSequenceCounter.map{ |t, s| t }
      sortedSequenceCounters = frameTimeSequenceCounter.map{ |t, s| s }

      # align event times with frame times so that counter calculations are correct
      timeKeyIdx = 0
      @game.events.order(:event_time).each do |gameEvent|
        while ((sortedTimes[timeKeyIdx] < gameEvent.event_time) and
          (timeKeyIdx < (sortedTimes.count - 1)))
          timeKeyIdx += 1
        end
        gameEvents << {
          counter: sortedSequenceCounters[timeKeyIdx],
          time: sortedTimes[timeKeyIdx],
          event_type_id: gameEvent.event_type_id
        }
      end

      ge = {}
      ge[@game.id] = gameEvents

      return ge
    end

  end
end
