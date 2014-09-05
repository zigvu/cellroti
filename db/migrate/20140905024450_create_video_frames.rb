class CreateVideoFrames < ActiveRecord::Migration
  def change
    create_table :video_frames do |t|
      t.datetime :frame_time
      t.integer :frame_number
      t.references :video, index: true

      t.timestamps
    end
  end
end
