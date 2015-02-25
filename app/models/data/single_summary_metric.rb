class SingleSummaryMetric
	include Mongoid::Document

	field :ft, as: :frame_time, type: Integer
	field :be, as: :brand_effectiveness, type: Float
	field :dgc, as: :det_group_crowding, type: Float
	field :vs, as: :visual_saliency, type: Float
	field :te, as: :timing_effectiveness, type: Float
	field :se, as: :spatial_effectiveness, type: Float
	field :dc, as: :detections_count, type: Integer
	field :vd, as: :view_duration, type: Float
	field :qd, as: :quadrants, type: Hash

	belongs_to :summary_metric, index: true
end
