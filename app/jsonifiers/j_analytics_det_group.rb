module Jsonifiers
	class JAnalyticsDetGroup < Jsonifiers::JAnalytics
		def initialize(detGroup)
			@detGroup = detGroup
			@cacheKey = "#{@detGroup.cache_key}/JAnalyticsDetGroup"
		end

		def to_json
			return getDetGroupDetails()
		end

		def getDetGroupDetails
			raise 'Need a cache key for JAnalyticsDetGroup class' if @cacheKey == nil
			retJSON = Rails.cache.fetch(@cacheKey) do 
				getDetGroupDetails_NonChached()
			end
		end

		def getDetGroupDetails_NonChached
			retHash = {}
			retHash[:id] = @detGroup.id
			retHash[:name] = @detGroup.name
			retHash[:pretty_name] = @detGroup.pretty_name
			retHash[:brands] = []
			@detGroup.detectables.each do |d|
				retHash[:brands] << {id: d.id, name: d.pretty_name}
			end
			return retHash.to_json
		end

	end
end
