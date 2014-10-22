class AddBrandEffectivenessToSummaryDetGroup60Seconds < ActiveRecord::Migration
  def change
    add_column :summary_det_group60_seconds, :brand_effectiveness, :float
  end
end
