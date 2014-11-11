class DropVideoFrame < ActiveRecord::Migration
	def up
		drop_table :video_frames
	end
	def down
		raise ActiveRecord::IrreversibleMigration
	end
end
