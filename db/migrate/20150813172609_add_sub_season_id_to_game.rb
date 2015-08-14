class AddSubSeasonIdToGame < ActiveRecord::Migration
  def change
    add_reference :games, :sub_season, index: true
  end
end
