class Game < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :sub_season, touch: true
  has_many :videos, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :game_teams, dependent: :destroy
  has_many :teams, through: :game_teams
  accepts_nested_attributes_for :game_teams, allow_destroy: true, reject_if: :all_blank
end
