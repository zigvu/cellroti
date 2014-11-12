class GameTeam < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :game, touch: true
  belongs_to :team
end
