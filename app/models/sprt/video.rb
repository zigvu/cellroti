class Video < ActiveRecord::Base
	# For authority
	include Authority::Abilities

	before_destroy :destroy_mongo_documents, prepend: true

	# Mock a has_many relationship with Mongoid models
	def video_detections
		VideoDetection.where(video_id: self.id)
	end

	def detectable_metrics
		DetectableMetric.where(video_id: self.id)
	end

	def det_group_metrics
		DetGroupMetric.where(video_id: self.id)
	end

	def summary_metrics
		SummaryMetric.where(video_id: self.id)
	end

	belongs_to :game, touch: true

	private
    def destroy_mongo_documents
      VideoDetection.destroy_all(video_id: self.id)
      DetectableMetric.destroy_all(video_id: self.id)
      DetGroupMetric.destroy_all(video_id: self.id)
      SummaryMetric.destroy_all(video_id: self.id)
    end
end
