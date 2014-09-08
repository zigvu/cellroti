class  GameAuthorizer < ApplicationAuthorizer

	def self.default(adjective, user)
    (user.has_role? States::Roles.zigvu_admin) || (user.has_role? States::Roles.zigvu_user)
  end

end
