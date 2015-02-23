module Metrics
	class MetricsEventDistance
		attr_accessor :events, :timeWeight, :eventWeights, :maxTimeSeconds

		def initialize(events, maxTimeSeconds, timeDecayWeight)
			@events = events
			@maxTimeSeconds = maxTimeSeconds
			if timeDecayWeight.size() != @maxTimeSeconds
				raise "Decay array must be the same size as maxTimeSeconds"
			end
			@timeWeight = {}
			(0..(@maxTimeSeconds - 1)).to_a.reverse.each_with_index do |t, idx|
				@timeWeight[t] = timeDecayWeight[idx]
			end

			@eventWeights = {}
			@events.each do |event|
				@eventWeights[event.id] = {}
				@eventWeights[event.id][:weight] = event.event_type.weight
				@eventWeights[event.id][:time] = event.event_time
			end
		end

		def get_event_score(timeStamp)
			score = 0.0
			@eventWeights.each do |eventId, eventDetails|
				timeDiff = (time_diff(timeStamp, eventDetails[:time])).floor
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

		def time_diff(timeStamp1, timeStamp2)
			# subtract time, convert to seconds and return
			return (timeStamp1 - timeStamp2).abs / 1000.0
		end

	end
end