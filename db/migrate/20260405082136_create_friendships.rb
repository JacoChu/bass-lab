class CreateFriendships < ActiveRecord::Migration[8.1]
  def change
    create_table :friendships do |t|
      t.references :user,   null: false, foreign_key: { to_table: :users }
      t.references :friend, null: false, foreign_key: { to_table: :users }
      t.integer :status, null: false, default: 0  # 0: pending, 1: accepted, 2: blocked
      t.datetime :requested_at, null: false

      t.timestamps
    end

    # Prevent duplicate friendship records between the same two users
    add_index :friendships, [:user_id, :friend_id], unique: true
  end
end
