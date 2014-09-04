class CreateDetectables < ActiveRecord::Migration
  def change
    create_table :detectables do |t|
      t.string :name
      t.string :pretty_name
      t.text :description
      t.integer :creator_id
      t.references :organization, index: true

      t.timestamps
    end
  end
end
