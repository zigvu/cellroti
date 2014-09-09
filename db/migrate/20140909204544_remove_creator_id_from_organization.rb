class RemoveCreatorIdFromOrganization < ActiveRecord::Migration
  def change
    remove_column :organizations, :creator_id, :integer
  end
end
