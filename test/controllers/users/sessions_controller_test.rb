require "test_helper"

class Users::SessionsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = User.create!(
      email: "user2fa@example.com", password: "password123",
      display_name: "2FA User", role: :user
    )
  end

  test "POST sign_in without 2FA signs in normally" do
    post "/users/sign_in", params: { user: { email: @user.email, password: "password123" } }
    assert_response :success
    # User is signed in — next request should be authenticated.
    get "/users/two_factor/setup"
    assert_response :success
  end

  test "POST sign_in with 2FA enabled returns two_factor_required" do
    @user.update!(otp_required_for_login: true, otp_secret: User.generate_otp_secret)
    post "/users/sign_in", params: { user: { email: @user.email, password: "password123" } }
    assert_response :success
    json = JSON.parse(response.body)
    assert json["two_factor_required"]
  end

  test "POST verify_otp with valid code completes sign-in" do
    secret = User.generate_otp_secret
    @user.update!(otp_required_for_login: true, otp_secret: secret)
    post "/users/sign_in", params: { user: { email: @user.email, password: "password123" } }

    otp = ROTP::TOTP.new(secret).now
    post "/users/sessions/verify_otp", params: { otp_attempt: otp }
    assert_response :success

    # Confirm user is now signed in.
    get "/users/two_factor/setup"
    assert_response :success
  end

  test "POST verify_otp with invalid code returns 422" do
    secret = User.generate_otp_secret
    @user.update!(otp_required_for_login: true, otp_secret: secret)
    post "/users/sign_in", params: { user: { email: @user.email, password: "password123" } }

    post "/users/sessions/verify_otp", params: { otp_attempt: "000000" }
    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "Invalid two-factor code", json["error"]
  end
end
