class CreateOrganizations < ActiveRecord::Migration
  def change
    create_table :organizations do |t|
      t.string :name
      t.string :industry
      t.integer :creator_id

      t.timestamps
    end
  end
end
