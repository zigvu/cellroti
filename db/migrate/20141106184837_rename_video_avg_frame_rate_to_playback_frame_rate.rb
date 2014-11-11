class RenameVideoAvgFrameRateToPlaybackFrameRate < ActiveRecord::Migration
  def change
  	rename_column :videos, :avg_frame_rate, :playback_frame_rate
  end
end
