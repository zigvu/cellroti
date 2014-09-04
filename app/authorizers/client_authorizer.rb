class  ClientAuthorizer < ApplicationAuthorizer

	def self.default(adjective, user)
		user.has_role? States::Roles.zigvu_admin
  end

end
