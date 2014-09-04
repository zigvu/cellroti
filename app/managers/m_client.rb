module Managers
	class MClient
		def initialize(client)
			@client = client
		end

		def getDetectableIds
			Serializers::ClientSettingsSerializer.new(@client.client_setting).getBrandsDetectables
		end

		def setDetectableIds(detectable_ids)
			Serializers::ClientSettingsSerializer.new(@client.client_setting)
				.replaceBrandsDetectables(detectable_ids)
		end

	end
end