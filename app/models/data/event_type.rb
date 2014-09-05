class EventType < ActiveRecord::Base
  belongs_to :sport
  has_many :events
end
