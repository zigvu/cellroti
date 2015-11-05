class  DetGroupAuthorizer < ApplicationAuthorizer

  def self.readable_by?(user)
    States::Roles.client_user_and_above(user)
  end

  def readable_by?(user)
    States::Roles.client_user_and_above(user) && (
      resource.clients.pluck(:id).include?(user.client.id))
  end

end
