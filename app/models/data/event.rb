class Event < ActiveRecord::Base
  belongs_to :event_type
  belongs_to :game
  belongs_to :team
end
