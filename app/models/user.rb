class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  enum :role, { user: 0, staff: 1, super_admin: 2 }

  has_many :sent_friendships,     class_name: "Friendship", foreign_key: :user_id,   dependent: :destroy
  has_many :received_friendships, class_name: "Friendship", foreign_key: :friend_id, dependent: :destroy

  has_many :orders, dependent: :destroy

  validates :display_name, presence: true
end
