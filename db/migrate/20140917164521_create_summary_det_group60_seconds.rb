class CreateSummaryDetGroup60Seconds < ActiveRecord::Migration
  def change
    create_table :summary_det_group60_seconds do |t|
      t.float :det_group_crowding
      t.float :visual_saliency
      t.float :timing_effectiveness
      t.float :spatial_effectiveness
      t.integer :detections_count
      t.string :quadrants
      t.integer :frame_time
      t.references :det_group, index: true
      t.references :video, index: true

      t.timestamps
    end
  end
end
