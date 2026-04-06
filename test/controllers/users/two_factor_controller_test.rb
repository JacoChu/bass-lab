require "test_helper"

class Users::TwoFactorControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = User.create!(
      email: "user@example.com", password: "password123",
      display_name: "Test User", role: :user
    )
    sign_in @user
  end

  test "GET setup returns 200 and generates a secret in session" do
    get "/users/two_factor/setup"
    assert_response :success
    assert session[:pending_otp_secret].present?
  end

  test "POST enable with valid OTP activates 2FA" do
    get "/users/two_factor/setup"
    secret = session[:pending_otp_secret]
    otp = ROTP::TOTP.new(secret).now
    post "/users/two_factor/enable", params: { otp_attempt: otp }
    assert_response :success
    @user.reload
    assert @user.otp_required_for_login
  end

  test "POST enable with invalid OTP returns 422" do
    get "/users/two_factor/setup"
    post "/users/two_factor/enable", params: { otp_attempt: "000000" }
    assert_response :unprocessable_entity
    @user.reload
    assert_not @user.otp_required_for_login
  end

  test "DELETE disable turns off 2FA" do
    @user.update!(otp_required_for_login: true, otp_secret: ROTP::Base32.random)
    delete "/users/two_factor"
    assert_response :success
    @user.reload
    assert_not @user.otp_required_for_login
    assert_nil @user.otp_secret
  end
end
