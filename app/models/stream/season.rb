class Season < ActiveRecord::Base
  # For authority
  include Authority::Abilities

  belongs_to :league
  has_many :sub_seasons, dependent: :destroy
  # through relationships
  has_many :games, through: :sub_seasons
  has_many :events, through: :games
end
