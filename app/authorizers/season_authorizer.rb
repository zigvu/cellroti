class  SeasonAuthorizer < ApplicationAuthorizer

  def self.readable_by?(user)
    States::Roles.client_user_and_above(user)
  end

  def readable_by?(user)
  	mc = Managers::MClient.new(user.client)
    States::Roles.client_user_and_above(user) && mc.getAllowedSeasonIds.include?(resource.id)
  end

end
