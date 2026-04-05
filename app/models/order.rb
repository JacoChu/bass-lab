class Order < ApplicationRecord
  belongs_to :user

  enum :status, { pending: 0, confirmed: 1, cancelled: 2 }

  validates :amount_cents, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :status, presence: true
end
