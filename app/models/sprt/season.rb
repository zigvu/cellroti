class Season < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :league
  has_many :games, dependent: :destroy
	# through relationships
	has_many :events, through: :games
end
