class CreateSeasons < ActiveRecord::Migration
  def change
    create_table :seasons do |t|
      t.string :name
      t.text :description
      t.references :league, index: true

      t.timestamps
    end
  end
end
