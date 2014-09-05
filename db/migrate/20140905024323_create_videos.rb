class CreateVideos < ActiveRecord::Migration
  def change
    create_table :videos do |t|
      t.text :title
      t.text :description
      t.text :comment
      t.string :source_type
      t.string :source_url
      t.string :quality
      t.string :format
      t.integer :length
      t.string :runstatus
      t.datetime :start_time
      t.datetime :end_time
      t.float :avg_frame_rate
      t.references :game, index: true

      t.timestamps
    end
  end
end
