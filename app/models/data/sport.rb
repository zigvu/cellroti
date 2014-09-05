class Sport < ActiveRecord::Base
	has_many :leagues
	has_many :event_types
end
