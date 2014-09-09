class RemoveCreatorIdFromDetectable < ActiveRecord::Migration
  def change
    remove_column :detectables, :creator_id, :integer
  end
end
