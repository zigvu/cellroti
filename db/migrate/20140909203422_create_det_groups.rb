class CreateDetGroups < ActiveRecord::Migration
  def change
    create_table :det_groups do |t|
      t.string :name
      t.references :user, index: true

      t.timestamps
    end
  end
end
