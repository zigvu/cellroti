class FrameDetection
	include Mongoid::Document

	field :fn, as: :frame_number, type: Integer
	field :ft, as: :frame_time, type: Integer

	embeds_many :single_raw_detections
	embeds_many :single_detectable_metrics
	embeds_many :single_det_group_metrics

	# needed if we want to order_by on frame_number
	index({ frame_number: 1 })

	belongs_to :video_detection, index: true
end
