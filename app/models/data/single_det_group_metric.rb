class SingleDetGroupMetric
	include Mongoid::Document

	field :dgId, as: :det_group_id, type: Integer
	field :be, as: :brand_effectiveness, type: Float
	field :dgc, as: :det_group_crowding, type: Float
	field :vs, as: :visual_saliency, type: Float
	field :te, as: :timing_effectiveness, type: Float
	field :se, as: :spatial_effectiveness, type: Float
	field :dc, as: :detections_count, type: Integer
	field :qd, as: :quadrants, type: Hash

	embedded_in :frame_detection
end
