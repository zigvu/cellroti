module Jsonifiers
	class JAnalytics
		def initialize
		end

		def to_json
			raise 'Need a cache key for all analytics jsonifiers' if @cacheKey == nil
			retJSON = Rails.cache.fetch(@cacheKey) do 
				get_data_hash().to_json
			end
		end

		def to_csv
			raise "Not implemented yet"
		end
	end
end