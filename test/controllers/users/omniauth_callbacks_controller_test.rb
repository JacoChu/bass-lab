require "test_helper"

class Users::OmniauthCallbacksControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  GOOGLE_AUTH_HASH = OmniAuth::AuthHash.new(
    provider: "google_oauth2",
    uid:      "g-uid-123",
    info: OmniAuth::AuthHash::InfoHash.new(
      email: "alice@example.com",
      name:  "Alice Google"
    )
  )

  setup do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google_oauth2] = GOOGLE_AUTH_HASH
    Rails.application.env_config["omniauth.auth"] = GOOGLE_AUTH_HASH
  end

  teardown do
    OmniAuth.config.test_mode = false
    Rails.application.env_config.delete("omniauth.auth")
  end

  test "creates new user on first Google sign-in" do
    assert_difference "User.count", 1 do
      get "/users/auth/google_oauth2/callback"
    end
    user = User.find_by(uid: "g-uid-123")
    assert_not_nil user
    assert_equal "google_oauth2", user.provider
    assert_equal "Alice Google",  user.display_name
    assert_redirected_to root_path
  end

  test "signs in existing user without creating duplicate" do
    existing = User.create!(
      email: "alice@example.com", provider: "google_oauth2", uid: "g-uid-123",
      display_name: "Alice", password: Devise.friendly_token
    )
    assert_no_difference "User.count" do
      get "/users/auth/google_oauth2/callback"
    end
    # Should be signed in as the existing user.
    assert_redirected_to root_path
    assert_equal existing.id, User.find_by(uid: "g-uid-123").id
  end

  test "links Google identity to existing password account with same email" do
    password_user = User.create!(
      email: "alice@example.com", display_name: "Alice PW",
      password: "password123"
    )
    assert_no_difference "User.count" do
      get "/users/auth/google_oauth2/callback"
    end
    password_user.reload
    assert_equal "google_oauth2", password_user.provider
    assert_equal "g-uid-123",    password_user.uid
  end
end
