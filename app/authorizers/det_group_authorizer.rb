class  DetGroupAuthorizer < ApplicationAuthorizer

	def self.default(adjective, user)
    States::Roles.client_admin_and_above(user)
  end

  def self.readable_by?(user)
    States::Roles.client_user_and_above(user)
  end

  def readable_by?(user)
    States::Roles.client_user_and_above(user) && (resource.client == user.client)
  end

end
