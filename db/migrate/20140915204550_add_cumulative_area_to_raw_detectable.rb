class AddCumulativeAreaToRawDetectable < ActiveRecord::Migration
  def change
    add_column :raw_detectables, :cumulative_area, :float
  end
end
