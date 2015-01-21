class SingleDetectableMetric
	include Mongoid::Document

	field :di, as: :detectable_id, type: Integer
	field :se, as: :spatial_effectiveness, type: Float
	field :vs, as: :visual_saliency, type: Float
	field :dc, as: :detections_count, type: Integer
	field :ca, as: :cumulative_area, type: Float
	field :es, as: :event_score, type: Float
	field :qd, as: :quadrants, type: Hash

	embedded_in :frame_detection
end
