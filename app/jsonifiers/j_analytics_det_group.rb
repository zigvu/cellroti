module Jsonifiers
	class JAnalyticsDetGroup < Jsonifiers::JAnalytics
		def initialize(detGroup)
			@detGroup = detGroup
		end

		def get_data_hash
			retHash = {}
			retHash[:id] = @detGroup.id
			retHash[:name] = @detGroup.name
			retHash[:brands] = []
			@detGroup.detectables.each do |d|
				retHash[:brands] << {id: d.id, name: d.pretty_name}
			end
			return retHash
		end

	end
end
