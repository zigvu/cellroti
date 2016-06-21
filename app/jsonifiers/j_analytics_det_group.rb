module Jsonifiers
  class JAnalyticsDetGroup < Jsonifiers::JAnalytics
    def initialize(detGroup)
      @detGroup = detGroup
      @cacheKey = "#{@detGroup.cache_key}/JAnalyticsDetGroup"
    end

    def to_json
      Rails.cache.fetch(@cacheKey) do
        getDetGroupDetails()
      end
    end

    def getDetGroupDetails
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
