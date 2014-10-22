class AddBrandEffectivenessToDetGroupVideoFrame < ActiveRecord::Migration
  def change
    add_column :det_group_video_frames, :brand_effectiveness, :float
  end
end
