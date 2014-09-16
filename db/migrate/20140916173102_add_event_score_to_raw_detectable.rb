class AddEventScoreToRawDetectable < ActiveRecord::Migration
  def change
    add_column :raw_detectables, :event_score, :float
  end
end
