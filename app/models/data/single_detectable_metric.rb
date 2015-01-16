class SingleDetectableMetric
	include Mongoid::Document

	field :fn, as: :frame_number, type: Integer
	field :ft, as: :frame_time, type: Integer
	field :di, as: :detectable_id, type: Integer
	field :se, as: :spatial_effectiveness, type: Float
	field :vs, as: :visual_saliency, type: Float
	field :dc, as: :detections_count, type: Integer
	field :ca, as: :cumulative_area, type: Float
	field :es, as: :event_score, type: Float
	field :qd, as: :quadrants, type: Hash

	# needed if we want to order_by on frame_number
	index({ frame_number: 1 })

	belongs_to :detectable_metric, index: true
end
