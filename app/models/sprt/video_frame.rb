class VideoFrame < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :video
end
