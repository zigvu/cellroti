class EventType < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :sport
  has_many :events, dependent: :destroy
end
