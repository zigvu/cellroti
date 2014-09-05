class Sport < ActiveRecord::Base
	# For authority
	include Authority::Abilities

	has_many :leagues
	has_many :event_types
end
