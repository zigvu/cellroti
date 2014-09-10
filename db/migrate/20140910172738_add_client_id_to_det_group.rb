class AddClientIdToDetGroup < ActiveRecord::Migration
  def change
    add_reference :det_groups, :client, index: true
  end
end
