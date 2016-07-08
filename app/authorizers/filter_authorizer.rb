class  FilterAuthorizer < ApplicationAuthorizer

  def self.updatable_by?(user)
    States::Roles.client_user_and_above(user)
  end

  def updatable_by?(user)
    States::Roles.client_user_and_above(user) && (resource.user_id == user.id)
  end

end
