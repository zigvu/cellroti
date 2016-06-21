class Video < ActiveRecord::Base
  # For authority
  include Authority::Abilities

  before_destroy :destroy_mongo_documents, prepend: true
  before_destroy :destroy_import_data, prepend: true

  # Mock a has_many relationship with Mongoid models
  def video_detections
    VideoDetection.where(video_id: self.id)
  end

  def summary_metrics
    SummaryMetric.where(video_id: self.id)
  end

  belongs_to :game, touch: true
  belongs_to :channel, touch: true

  private
    def destroy_mongo_documents
      VideoDetection.destroy_all(video_id: self.id)
      SummaryMetric.destroy_all(video_id: self.id)
    end

    # destroy import data from kheer
    def destroy_import_data
      Managers::MVideo.new(self).delete_localization_folder
    end
end
