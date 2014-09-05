class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.datetime :event_time
      t.references :event_type, index: true
      t.references :game, index: true
      t.references :team, index: true

      t.timestamps
    end
  end
end
