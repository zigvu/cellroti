class  GameAuthorizer < ApplicationAuthorizer

	def self.default(adjective, user)
    States::Roles.zigvu_user_and_above(user)
  end

end
