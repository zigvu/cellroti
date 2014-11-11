class Video < ActiveRecord::Base
	# For authority
	include Authority::Abilities

	# Mock a has_many relationship with Mongoid models
	def video_detections
		VideoDetection.where(video_id: self.id)
	end

	def detectable_metrics
		DetectableMetric.where(video_id: self.id)
	end

	def det_group_metrics
		DetGroupMetric.where(video_id: self.id)
	end

	def summary_metrics
		SummaryMetric.where(video_id: self.id)
	end

	belongs_to :game
	has_many :video_frames, dependent: :destroy
end
