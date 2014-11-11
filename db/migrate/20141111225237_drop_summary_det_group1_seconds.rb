class DropSummaryDetGroup1Seconds < ActiveRecord::Migration
  def up
  	drop_table :summary_det_group1_seconds
  end
  def down
  	raise ActiveRecord::IrreversibleMigration
  end
end
