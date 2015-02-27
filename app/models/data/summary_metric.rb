class SummaryMetric
  include Mongoid::Document

	field :video_id, type: Integer
	field :det_group_id, type: Integer
	field :resolution_seconds, type: Integer
	field :sequence_counter_begin, type: Integer
	field :sequence_counter_end, type: Integer

	index({ video_id: 1, det_group_id: 1, resolution_seconds: 1 }, { background: true })

	# Mock a belongs_to relationship with sql models
	def video
		Video.find(self.video_id)
	end

	def det_group
		DetGroup.find(self.det_group_id)
	end

	has_many :single_summary_metrics, dependent: :destroy, autosave: true, :order => :frame_time.asc
end
