class VideoFrame < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :video
  has_many :detections, dependent: :destroy
  has_many :raw_detectables, dependent: :destroy
  has_many :det_group_video_frames, dependent: :destroy
end
