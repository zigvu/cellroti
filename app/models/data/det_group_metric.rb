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

	has_many :single_det_group_metrics, dependent: :destroy, autosave: true
end
