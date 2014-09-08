class RemoveSeasonIdFromTeam < ActiveRecord::Migration
  def change
    remove_reference :teams, :season, index: true
  end
end
