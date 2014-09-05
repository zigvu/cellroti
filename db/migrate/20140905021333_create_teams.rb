class CreateTeams < ActiveRecord::Migration
  def change
    create_table :teams do |t|
      t.string :name
      t.text :description
      t.string :icon_path
      t.references :season, index: true

      t.timestamps
    end
  end
end
