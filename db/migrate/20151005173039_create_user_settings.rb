class CreateUserSettings < ActiveRecord::Migration
  def change
    create_table :user_settings do |t|
      t.text :seasonAnalysis
      t.references :user, index: true

      t.timestamps
    end
  end
end
