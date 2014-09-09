module States
	class Roles

		def initialize
		end

		def self.zigvu_admin
			return :zigvu_admin
		end

		def self.zigvu_user
			return :zigvu_user
		end

		def self.client_admin
			return :client_admin
		end

		def self.client_user
			return :client_user
		end

		def self.guest_user
			return :guest_user
		end

	end
end
