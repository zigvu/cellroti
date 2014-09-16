module Metrics
	class SlidingWindow
		def initialize(windowSize, decayArray)
			@windowSize = windowSize
			@decayArray = decayArray
			if @decayArray.size() != @windowSize
				raise RuntimeError("Decay array must be the same size as window")
			end
			@data = Array.new(@windowSize, 0)
		end

		def add(newValue)
			@data.shift
			@data.push(newValue)
		end

		def get_decayed_average
			avg = 0
			@data.each_with_index do |d, idx|
				avg += (d * @decayArray[idx])
			end
			return avg
		end

		def get_max
			return @data.max
		end

		def self.get_sliding_window_hash(ids, slidingWindowSize, slidingWindowDecayValues)
			sliding_windows = {}
			ids.each do |id|
				sliding_windows[id] = Metrics::SlidingWindow.new(slidingWindowSize, slidingWindowDecayValues)
			end
			return sliding_windows
		end

	end
end