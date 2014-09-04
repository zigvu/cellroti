class CreateClients < ActiveRecord::Migration
  def change
    create_table :clients do |t|
      t.string :name
      t.string :pretty_name
      t.text :description
      t.integer :client_setting_id
      t.integer :organization_id

      t.timestamps
    end
  end
end
