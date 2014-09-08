class AddLeagueIdToTeam < ActiveRecord::Migration
  def change
    add_reference :teams, :league, index: true
  end
end
