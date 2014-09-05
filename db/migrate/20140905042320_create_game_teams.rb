class CreateGameTeams < ActiveRecord::Migration
  def change
    create_table :game_teams do |t|
      t.references :game, index: true
      t.references :team, index: true

      t.timestamps
    end
  end
end
