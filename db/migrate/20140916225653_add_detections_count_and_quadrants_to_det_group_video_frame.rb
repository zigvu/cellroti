class AddDetectionsCountAndQuadrantsToDetGroupVideoFrame < ActiveRecord::Migration
  def change
    add_column :det_group_video_frames, :detections_count, :integer
    add_column :det_group_video_frames, :quadrants, :string
  end
end
