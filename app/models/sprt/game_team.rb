class GameTeam < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :game
  belongs_to :team
end
