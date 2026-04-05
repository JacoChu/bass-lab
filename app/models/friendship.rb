class Friendship < ApplicationRecord
  belongs_to :user
  belongs_to :friend, class_name: "User"

  enum :status, { pending: 0, accepted: 1, blocked: 2 }

  validates :user_id, uniqueness: { scope: :friend_id }
  validates :requested_at, presence: true
  validate :no_duplicate_active_relationship, on: :create

  private

  def no_duplicate_active_relationship
    return unless user_id && friend_id
    if Friendship.where(user_id: [ user_id, friend_id ], friend_id: [ user_id, friend_id ])
                 .where(status: [ :pending, :accepted ])
                 .exists?
      errors.add(:base, "Friend request already sent")
    end
  end

  before_validation :set_requested_at, on: :create

  # Returns all accepted friends for a given user (both directions)
  scope :accepted_for, ->(user) {
    accepted.where("user_id = :id OR friend_id = :id", id: user.id)
  }

  def set_requested_at
    self.requested_at ||= Time.current
  end
end
