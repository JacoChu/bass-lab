class CreateAdminUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :admin_users do |t|
      t.string  :email,              null: false, default: ""
      t.string  :encrypted_password, null: false, default: ""
      t.integer :role,               null: false, default: 0  # 0: staff, 1: super_admin

      # Devise recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      # Devise rememberable
      t.datetime :remember_created_at

      t.timestamps
    end

    add_index :admin_users, :email,                unique: true
    add_index :admin_users, :reset_password_token, unique: true
  end
end
