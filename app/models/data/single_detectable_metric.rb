class SingleDetectableMetric
	include Mongoid::Document

	field :di, as: :detectable_id, type: Integer

	field :dgc, as: :det_group_crowding, type: Float
	field :vs, as: :visual_saliency, type: Float
	field :te, as: :timing_effectiveness, type: Float
	field :se, as: :spatial_effectiveness, type: Float

	field :vd, as: :view_duration, type: Float
	field :vp, as: :view_persistence, type: Float

	field :qd, as: :quadrants, type: Hash

	embedded_in :frame_detection
end
