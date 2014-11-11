class DropSummaryDetGroup10Seconds < ActiveRecord::Migration
  def up
  	drop_table :summary_det_group10_seconds
  end
  def down
  	raise ActiveRecord::IrreversibleMigration
  end
end
