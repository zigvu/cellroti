class League < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :sport
	has_many :teams, dependent: :destroy
  has_many :seasons, dependent: :destroy
	# through relationships
	has_many :games, through: :seasons
	has_many :events, through: :games
end
