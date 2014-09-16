class AddWeightToEventType < ActiveRecord::Migration
  def change
    add_column :event_types, :weight, :float
  end
end
