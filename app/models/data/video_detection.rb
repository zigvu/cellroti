class VideoDetection
	include Mongoid::Document
	include Mongoid::Timestamps

	field :video_id, type: Integer
	field :detectable_ids, type: Array
	field :extracted_frames, type: Array

	index({ video_id: 1 }, { background: true })

	# Mock a belongs_to relationship with Video model
	def video
		Video.find(self.video_id)
	end

	has_many :frame_detections, dependent: :destroy, autosave: true, :order => :frame_number.asc
end
