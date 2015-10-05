class  SeasonAuthorizer < ApplicationAuthorizer

  def self.readable_by?(user)
    States::Roles.client_user_and_above(user)
  end

  def readable_by?(user)
    allowedSeasons = user.client.settings.getSeasonsAllowed
    States::Roles.client_user_and_above(user) && allowedSeasons.include?(resource.id)
  end

end
