class RemoveSeasonIdFromGame < ActiveRecord::Migration
  def change
    remove_reference :games, :season, index: true
  end
end
