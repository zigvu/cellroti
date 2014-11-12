class VideoDetection
	include Mongoid::Document
	include Mongoid::Timestamps

	field :video_id, type: Integer
	field :detections, type: Hash
	field :detectable_ids, type: Array

	index({video_id: 1})

	# Mock a belongs_to relationship with Video model
	def video
		Video.find(self.video_id)
	end

end