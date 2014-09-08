class Team < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :league
  has_many :game_teams, dependent: :destroy
end
