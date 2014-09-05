class League < ActiveRecord::Base
  belongs_to :sport
  has_many :seasons
end
