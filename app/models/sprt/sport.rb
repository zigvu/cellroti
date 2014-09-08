class Sport < ActiveRecord::Base
	# For authority
	include Authority::Abilities

	has_many :leagues, dependent: :destroy
	has_many :event_types, dependent: :destroy
	# through relationships
	has_many :teams, through: :leagues
	has_many :seasons, through: :leagues
	has_many :games, through: :seasons
	has_many :events, through: :games
end
