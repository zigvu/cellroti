class DropDetection < ActiveRecord::Migration
	def up
		drop_table :detections
	end
	def down
		raise ActiveRecord::IrreversibleMigration
	end
end
