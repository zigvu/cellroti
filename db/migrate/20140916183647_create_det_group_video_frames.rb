class CreateDetGroupVideoFrames < ActiveRecord::Migration
  def change
    create_table :det_group_video_frames do |t|
      t.float :det_group_crowding
      t.float :visual_saliency
      t.float :timing_effectiveness
      t.float :spatial_effectiveness
      t.references :det_group, index: true
      t.references :video_frame, index: true

      t.timestamps
    end
  end
end
