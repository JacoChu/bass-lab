class AddSubscriptionFieldsToOrdersAndUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :orders, :period, :integer, null: true
    add_column :orders, :expires_at, :datetime, null: true
    add_column :users, :trial_sessions_used, :integer, default: 0, null: false
    add_index :orders, :expires_at
  end
end
