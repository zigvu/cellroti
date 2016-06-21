module Jsonifiers
  class DetGroupPackager < Jsonifiers::JAnalytics
    def initialize(detGroupIds)
      @detGroupIds = detGroupIds
    end

    def to_json
      # Note: creating cache key takes visiting all det groups, which won't be any faster
      getDetGroupName().to_json
    end

    def getDetGroupName
      detGroupMap = {}
      @detGroupIds.each do |detGroupId|
        detGroupMap[detGroupId] = DetGroup.find(detGroupId).pretty_name
      end
      return detGroupMap
    end

  end
end
