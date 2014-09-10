# Other authorizers should subclass this one
class ApplicationAuthorizer < Authority::Authorizer

  # Any class method from Authority::Authorizer that isn't overridden
  # will call its authorizer's default method.
  #
  # @param [Symbol] adjective; example: `:creatable`
  # @param [Object] user - whatever represents the current user in your app
  # @return [Boolean]
  def self.default(adjective, user)
    # Zigvu admin has all authority
    States::Roles.zigvu_admin_and_above(user)
  end

  def self.readable_by?(user)
    # Zigvu user has read authority
    States::Roles.zigvu_user_and_above(user)
  end

end
