class CreateLeagues < ActiveRecord::Migration
  def change
    create_table :leagues do |t|
      t.string :name
      t.text :description
      t.references :sport, index: true

      t.timestamps
    end
  end
end
