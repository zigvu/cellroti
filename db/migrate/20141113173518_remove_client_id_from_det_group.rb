class RemoveClientIdFromDetGroup < ActiveRecord::Migration
  def change
    remove_reference :det_groups, :client, index: true
  end
end
