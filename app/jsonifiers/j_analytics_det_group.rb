module Jsonifiers
	class JAnalyticsDetGroup < Jsonifiers::JAnalytics
		def initialize(detGroup)
			@detGroup = detGroup
			@cacheKey = "#{@detGroup.cache_key}/JAnalyticsDetGroup"
		end

		def get_data_hash
			raise 'Need a cache key for JAnalyticsDetGroup class' if @cacheKey == nil
			retJSON = Rails.cache.fetch(@cacheKey) do 
				get_data_hash_NonChached()
			end
		end

		def get_data_hash_NonChached
			retHash = {}
			retHash[:id] = @detGroup.id
			retHash[:name] = @detGroup.name
			retHash[:pretty_name] = @detGroup.pretty_name
			retHash[:brands] = []
			@detGroup.detectables.each do |d|
				retHash[:brands] << {id: d.id, name: d.pretty_name}
			end
			return retHash
		end

	end
end
