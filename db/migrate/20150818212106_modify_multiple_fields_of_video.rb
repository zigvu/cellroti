class ModifyMultipleFieldsOfVideo < ActiveRecord::Migration
  def change
    remove_column :videos, :description, :text
    remove_column :videos, :comment, :text
    remove_column :videos, :source_url, :string
    remove_column :videos, :format, :string
    remove_column :videos, :start_time, :datetime
    remove_column :videos, :end_time, :datetime

    add_column :videos, :start_frame_number, :integer
    add_column :videos, :end_frame_number, :integer
  end
end
