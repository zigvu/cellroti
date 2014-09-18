class AddDetectionFrameRateToVideo < ActiveRecord::Migration
  def change
    add_column :videos, :detection_frame_rate, :float
  end
end
