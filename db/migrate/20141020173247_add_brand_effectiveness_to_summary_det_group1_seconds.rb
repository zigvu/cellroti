class AddBrandEffectivenessToSummaryDetGroup1Seconds < ActiveRecord::Migration
  def change
    add_column :summary_det_group1_seconds, :brand_effectiveness, :float
  end
end
