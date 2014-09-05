class Season < ActiveRecord::Base
  belongs_to :league
  has_many :games
  has_many :teams
end
