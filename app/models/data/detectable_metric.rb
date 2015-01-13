class DetectableMetric
	include Mongoid::Document
	include Mongoid::Timestamps

	field :video_id, type: Integer

	index({video_id: 1})

	# Mock a belongs_to relationship with Video model
	def video
		Video.find(self.video_id)
	end

	has_many :single_detectable_metrics, dependent: :destroy, autosave: true
end
