class AddLockableToDevise < ActiveRecord::Migration
  def change
    # Lockable - copied from original devise migration
    # t.integer  :failed_attempts, :default => 0, :null => false # Only if lock strategy is :failed_attempts
    # t.string   :unlock_token # Only if unlock strategy is :email or :both
    # t.datetime :locked_at

    add_column :users, :failed_attempts, :integer, :default => 0, :null => false # Only if lock strategy is :failed_attempts
    add_column :users, :unlock_token, :string # Only if unlock strategy is :email or :both
    add_column :users, :locked_at, :datetime # Only if unlock strategy is :email or :both

    # Lockable index - copied from original devise migration
    add_index :users, :unlock_token,         :unique => true
  end
end
