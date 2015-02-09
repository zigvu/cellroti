module Jsonifiers
	class JAnalyticsArrayAverager < Jsonifiers::JAnalytics
		def initialize(size)
			@size = size
			@count = 0
			@arr = nil
		end

		def self.intervals
			return [5, 10, 30, 100]
		end

		def isFull?
			return @count == @size
		end

		def addData(data)
			if @arr == nil
				@arr = data
			else
				data.each_with_index do |d, i|
					@arr[i] = [@arr[i], d].max
				end
			end
			@count += 1
		end

		def getData
			return @arr
		end

		def reset
			@arr = nil
			@count = 0
		end

	end
end
