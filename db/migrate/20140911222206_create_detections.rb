class CreateDetections < ActiveRecord::Migration
  def change
    create_table :detections do |t|
      t.float :score
      t.integer :bbox_x
      t.integer :bbox_y
      t.integer :bbox_width
      t.integer :bbox_height
      t.references :video_frame, index: true
      t.references :detectable, index: true

      t.timestamps
    end
  end
end
