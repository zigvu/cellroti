class CreateDetGroupDetectables < ActiveRecord::Migration
  def change
    create_table :det_group_detectables do |t|
      t.references :det_group, index: true
      t.references :detectable, index: true

      t.timestamps
    end
  end
end
