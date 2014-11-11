class DropSummaryDetGroup60Seconds < ActiveRecord::Migration
	def up
		drop_table :summary_det_group60_seconds
	end
	def down
		raise ActiveRecord::IrreversibleMigration
	end
end
