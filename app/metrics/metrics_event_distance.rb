module Metrics
  class MetricsEventDistance
    attr_accessor :eventDetections, :timeWeight, :eventWeights, :maxTimeSeconds

    def initialize(eventDetections, maxTimeSeconds, timeDecayWeight)
      @eventDetections = eventDetections
      # time decay happens at 1 second interval - i.e., 1 FPS
      decayArray = Metrics::MetricsSlidingWindow.constructWindow(
        1, maxTimeSeconds, timeDecayWeight
      )
      # while the number of elements in decayArray will be close to maxTimeSeconds,
      # it is likely that it won't be exact - hence use maxTimeSeconds based on
      # size of decayArray
      @maxTimeSeconds = decayArray.count

      @timeWeight = {}
      decayArray.each_with_index do |da, idx|
        # since weights are symmetric in time, timeDecayWeight will have values
        # in monotonic increasing order
        @timeWeight[decayArray.count - idx - 1] = da
      end

      @eventWeights = {}
      @eventDetections.each do |event|
        @eventWeights[event.id] = {}
        @eventWeights[event.id][:weight] = event.weight
        @eventWeights[event.id][:time] = event.stream_frame_time
      end
    end

    def get_event_score(timeStamp)
      score = 0.0
      @eventWeights.each do |eventId, eventDetails|
        timeDiff = (time_diff(eventDetails[:time], timeStamp)).floor
        if timeDiff < @maxTimeSeconds
          #puts "Hit at: #{timeDiff}"
          score += @timeWeight[timeDiff] * eventDetails[:weight]
        end
      end
      # we have no control over the frequency and closeness of events
      # so need an upper-bound limit
      score = 1.0 if score > 1.0
      return score
    end

    def time_diff(earlierTimeStamp, laterTimeStamp)
      # subtract time, convert to seconds and return
      return (laterTimeStamp - earlierTimeStamp).abs / 1000.0
    end

  end
end
