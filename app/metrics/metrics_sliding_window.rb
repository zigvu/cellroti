module Metrics
	class MetricsSlidingWindow
		def initialize(detectionFPS, sizeSeconds, decayWeights)
			@decayArray = nil
			@data = nil
			# if we don't need to decay weights, no decay array will be supplied
			if decayWeights == nil
				@data = Array.new(detectionFPS * sizeSeconds, 0)
			else
				@decayArray = constructWindow(detectionFPS, sizeSeconds, decayWeights)
				@data = Array.new(@decayArray.size(), 0)
			end
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

		def get_min
			return @data.min
		end

		def reset
			@data = Array.new(@data.size(), 0)
		end

		def constructWindow(detectionFPS, sizeSeconds, decayWeights)
			decayArray = []
			jumpIdx = ((detectionFPS * sizeSeconds - decayWeights.size())/(decayWeights.size() - 1)).floor + 1
			jumpIdx = 1 if jumpIdx <= 0

			decayArray << decayWeights.first
			for idx in 0..(decayWeights.size() - 2)
				weightDiff = decayWeights[idx + 1] - decayWeights[idx]
				for i in 1..jumpIdx
					decayArray << (decayWeights[idx] + i * weightDiff / jumpIdx)
				end
			end

			# now, normalize so that sum is 1
			total = decayArray.sum

			decayArray.each_with_index do |da, idx|
				# sanity check - none of the weights should be negative
				raise "Decay weights negative" if da < 0
				# normalize
				decayArray[idx] = da/total
			end

			return decayArray
		end

	end
end