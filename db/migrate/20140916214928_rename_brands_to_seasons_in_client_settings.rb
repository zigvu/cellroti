class RenameBrandsToSeasonsInClientSettings < ActiveRecord::Migration
  def change
  	rename_column :client_settings, :brands, :seasons
  end
end
