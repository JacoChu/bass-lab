class Friendship < ApplicationRecord
  belongs_to :user
  belongs_to :friend, class_name: "User"

  enum :status, { pending: 0, accepted: 1, blocked: 2 }

  validates :user_id, uniqueness: { scope: :friend_id }
  validates :requested_at, presence: true

  before_validation :set_requested_at, on: :create

  # Returns all accepted friends for a given user (both directions)
  scope :accepted_for, ->(user) {
    accepted.where("user_id = :id OR friend_id = :id", id: user.id)
  }

  private

  def set_requested_at
    self.requested_at ||= Time.current
  end
end
