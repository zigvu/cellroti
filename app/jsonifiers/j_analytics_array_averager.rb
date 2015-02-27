module Jsonifiers
	class JAnalyticsArrayAverager < Jsonifiers::JAnalytics
		def initialize(size)
			@size = size
			@arr = []
		end

		def self.intervals
			return [5, 10, 30, 100]
		end

		def isFull?
			return @arr.count == @size
		end

		def addData(data)
			@arr << data
		end

		def getData
			retArr = nil
			@arr.each do |d|
				if retArr == nil
					retArr = d.map{ |v| v.to_f }
				else
					d.each_with_index do |dv, i|
						retArr[i] += dv.to_f
					end
				end
			end
			retArr.each_with_index do |dv, i|
				retArr[i] = dv/@arr.count if i != 6
			end
			return retArr
		end

		def reset
			@arr = []
		end

	end
end
