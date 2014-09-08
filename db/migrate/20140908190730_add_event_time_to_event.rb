class AddEventTimeToEvent < ActiveRecord::Migration
  def change
    add_column :events, :event_time, :integer
  end
end
