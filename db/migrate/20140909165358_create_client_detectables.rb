class CreateClientDetectables < ActiveRecord::Migration
  def change
    create_table :client_detectables do |t|
      t.references :client, index: true
      t.references :detectable, index: true

      t.timestamps
    end
  end
end
