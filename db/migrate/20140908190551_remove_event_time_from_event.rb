class RemoveEventTimeFromEvent < ActiveRecord::Migration
	# remove datetime field and replace with integer milliseconds
  def change
    remove_column :events, :event_time, :datetime
  end
end
