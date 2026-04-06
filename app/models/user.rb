class User < ApplicationRecord
  devise :database_authenticatable, :two_factor_authenticatable,
         :registerable, :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:google_oauth2]

  enum :role, { user: 0, staff: 1, super_admin: 2 }

  has_many :sent_friendships,     class_name: "Friendship", foreign_key: :user_id,   dependent: :destroy
  has_many :received_friendships, class_name: "Friendship", foreign_key: :friend_id, dependent: :destroy

  has_many :orders, dependent: :destroy

  validates :display_name, presence: true

  # Task 10.3 + 10.5 — find or create user from Google OAuth auth hash.
  def self.from_omniauth(auth)
    # Task 10.5 — link Google identity to existing password-based account.
    user = find_by(provider: auth.provider, uid: auth.uid) ||
           find_by(provider: nil, email: auth.info.email)

    if user
      user.update!(provider: auth.provider, uid: auth.uid)
      return user
    end

    create!(
      provider:     auth.provider,
      uid:          auth.uid,
      email:        auth.info.email,
      display_name: auth.info.name,
      password:     Devise.friendly_token
    )
  end

  def accepted_friends
    friend_ids = sent_friendships.accepted.pluck(:friend_id) +
                 received_friendships.accepted.pluck(:user_id)
    User.where(id: friend_ids)
  end

  def active_subscription?
    orders.active.exists?
  end

  def session_eligible?
    active_subscription? || trial_sessions_used < 2
  end
end
