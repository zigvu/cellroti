class Team < ActiveRecord::Base
  belongs_to :season
  has_many :game_teams
end
