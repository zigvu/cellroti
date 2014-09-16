class AddFrameTimeToVideoFrame < ActiveRecord::Migration
  def change
    add_column :video_frames, :frame_time, :integer
  end
end
