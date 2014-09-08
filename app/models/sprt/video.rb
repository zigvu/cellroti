class Video < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :game
  has_many :video_frames, dependent: :destroy
end
