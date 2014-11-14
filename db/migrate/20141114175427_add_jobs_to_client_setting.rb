class AddJobsToClientSetting < ActiveRecord::Migration
  def change
    add_column :client_settings, :jobs, :text
  end
end
