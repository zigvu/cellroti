class RemoveFrameTimeFromVideoFrame < ActiveRecord::Migration
  def change
    remove_column :video_frames, :frame_time, :datetime
  end
end
