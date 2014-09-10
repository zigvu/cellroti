class RemoveUserIdFromDetGroup < ActiveRecord::Migration
  def change
    remove_reference :det_groups, :user, index: true
  end
end
