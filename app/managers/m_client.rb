module Managers
	class MClient
		def initialize(client)
			@client = client
		end

		def getAllowedSeasonIds
			set_client_settings
			return [@scs.getSeasonsAllowed].flatten
		end

		def addAllowedSeasonIds(seasonIds)
			set_client_settings
			@scs.addSeasonsAllowed(seasonIds)
		end

		private
		
			def set_client_settings
				@scs = Serializers::ClientSettingsSerializer.new(@client.client_setting)
			end

	end
end