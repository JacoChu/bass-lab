class Order < ApplicationRecord
  belongs_to :user

  enum :status, { pending: 0, confirmed: 1, cancelled: 2 }
  enum :period, { monthly: 0, yearly: 1 }

  validates :amount_cents, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :status, presence: true
  validates :expires_at, presence: true, if: :confirmed?

  scope :active, -> { confirmed.where("expires_at > ?", Time.current) }
end
