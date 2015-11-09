class  ClientAuthorizer < ApplicationAuthorizer

  def self.default(adjective, user)
    States::Roles.client_admin_and_above(user)
  end

  def self.readable_by?(user)
    # need to override this since it is also a method in application_authorizer
    States::Roles.client_admin_and_above(user)
  end

  def readable_by?(user)
    ensure_right_client(user, resource)
  end


  private
    def ensure_right_client(user, resource)
      States::Roles.zigvu_user_and_above(user) || (
        States::Roles.client_admin_and_above(user) && user.client.id == resource.id)
    end
end
