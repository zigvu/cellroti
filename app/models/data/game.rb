class Game < ActiveRecord::Base
  belongs_to :season
  has_many :videos
  has_many :events
  has_many :game_teams
end
