class RenameDetectionsScoreToVisualSaliencyInRawDetectables < ActiveRecord::Migration
  def change
  	rename_column :raw_detectables, :detections_score, :visual_saliency
  end
end
