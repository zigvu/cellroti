class CreateDetGroupClients < ActiveRecord::Migration
  def change
    create_table :det_group_clients do |t|
      t.references :det_group, index: true
      t.references :client, index: true

      t.timestamps
    end
  end
end
