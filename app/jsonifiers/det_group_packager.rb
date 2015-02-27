module Jsonifiers
	class DetGroupPackager < Jsonifiers::JAnalytics
		def initialize(detGroupIds)
			@detGroupIds = detGroupIds
		end

		def detGroupNameJSON
			# check for cache
			retJSON = getDetGroupName().to_json
			return retJSON
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
