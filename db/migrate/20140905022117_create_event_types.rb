class CreateEventTypes < ActiveRecord::Migration
  def change
    create_table :event_types do |t|
      t.string :name
      t.text :description
      t.references :sport, index: true

      t.timestamps
    end
  end
end
