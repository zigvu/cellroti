class CreateRawDetectables < ActiveRecord::Migration
  def change
    create_table :raw_detectables do |t|
      t.float :spatial_effectiveness
      t.float :detections_score
      t.integer :detections_count
      t.string :quadrants
      t.references :video_frame, index: true
      t.references :detectable, index: true

      t.timestamps
    end
  end
end
