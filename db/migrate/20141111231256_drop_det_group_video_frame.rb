class DropDetGroupVideoFrame < ActiveRecord::Migration
	def up
		drop_table :det_group_video_frames
	end
	def down
		raise ActiveRecord::IrreversibleMigration
	end
end
