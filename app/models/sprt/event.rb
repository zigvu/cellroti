class Event < ActiveRecord::Base
	# For authority
	include Authority::Abilities

	# needed by input form
	attr_accessor :hours, :minutes, :seconds, :milliseconds

  belongs_to :event_type
  belongs_to :game, touch: true
  belongs_to :team
end
