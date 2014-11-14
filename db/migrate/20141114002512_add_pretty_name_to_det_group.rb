class AddPrettyNameToDetGroup < ActiveRecord::Migration
  def change
    add_column :det_groups, :pretty_name, :string
  end
end
