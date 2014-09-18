class Video < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  belongs_to :game
  has_many :video_frames, dependent: :destroy
  has_many :summary_det_group1_seconds, dependent: :destroy
  has_many :summary_det_group10_seconds, dependent: :destroy
  has_many :summary_det_group60_seconds, dependent: :destroy
end
