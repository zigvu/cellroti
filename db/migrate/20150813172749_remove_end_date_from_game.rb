class RemoveEndDateFromGame < ActiveRecord::Migration
  def change
    remove_column :games, :end_date, :datetime
  end
end
