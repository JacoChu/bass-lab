class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.references :user,   null: false, foreign_key: true
      t.integer    :status, null: false, default: 0  # 0: pending, 1: confirmed, 2: cancelled
      t.integer    :amount_cents, null: false, default: 0

      t.timestamps
    end

    add_index :orders, :status
    add_index :orders, :created_at
  end
end
