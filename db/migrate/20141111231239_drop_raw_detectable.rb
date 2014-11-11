class DropRawDetectable < ActiveRecord::Migration
	def up
		drop_table :raw_detectables
	end
	def down
		raise ActiveRecord::IrreversibleMigration
	end
end
