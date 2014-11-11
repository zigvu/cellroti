class DetGroupMetric
  include Mongoid::Document
	include Mongoid::Timestamps

	field :video_id, type: Integer
	field :det_group_id, type: Integer

	index({video_id: 1, det_group_id: 1})

	# Mock a belongs_to relationship with sql models
	def video
		Video.find(self.video_id)
	end

	def det_group
		DetGroup.find(self.det_group_id)
	end

	embeds_many :single_det_group_metrics, cascade_callbacks: true
end

class SingleDetGroupMetric
	include Mongoid::Document

	field :fn, as: :frame_number, type: Integer
	field :ft, as: :frame_time, type: Integer
	field :be, as: :brand_effectiveness, type: Float
	field :dgc, as: :det_group_crowding, type: Float
	field :vs, as: :visual_saliency, type: Float
	field :te, as: :timing_effectiveness, type: Float
	field :se, as: :spatial_effectiveness, type: Float
	field :dc, as: :detections_count, type: Integer
	field :qd, as: :quadrants, type: Hash

	embedded_in :det_group_metric
end
