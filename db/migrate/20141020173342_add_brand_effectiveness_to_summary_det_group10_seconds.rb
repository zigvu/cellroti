class AddBrandEffectivenessToSummaryDetGroup10Seconds < ActiveRecord::Migration
  def change
    add_column :summary_det_group10_seconds, :brand_effectiveness, :float
  end
end
