class CreateClientSettings < ActiveRecord::Migration
  def change
    create_table :client_settings do |t|
      t.text :brands
      t.integer :client_id

      t.timestamps
    end
  end
end
