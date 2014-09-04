class RemoveClientSettingIdFromClient < ActiveRecord::Migration
  def change
    remove_column :clients, :client_setting_id, :integer
  end
end
