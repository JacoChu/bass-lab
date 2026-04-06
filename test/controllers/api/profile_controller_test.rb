require "test_helper"

class Api::ProfileControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = User.create!(email: "profile@example.com", password: "password123", display_name: "Profile User", role: :user)
    sign_in @user
  end

  # GET /api/profile
  test "GET show returns user profile" do
    get "/api/profile", as: :json
    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal "Profile User", json["display_name"]
    assert_equal "profile@example.com", json["email"]
    assert json.key?("trial_sessions_used")
    assert json.key?("otp_required_for_login")
  end

  # PATCH /api/profile — display name update
  test "PATCH update changes display_name" do
    patch "/api/profile", params: { display_name: "New Name" }, as: :json
    assert_response :ok
    assert_equal "New Name", @user.reload.display_name
  end

  test "PATCH update rejects empty display_name" do
    patch "/api/profile", params: { display_name: "" }, as: :json
    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json.key?("errors")
  end

  # POST /api/profile/password — password change
  test "POST password with correct current password" do
    post "/api/profile/password",
      params: { current_password: "password123", new_password: "newpass456", new_password_confirmation: "newpass456" },
      as: :json
    assert_response :ok
  end

  test "POST password with wrong current password returns 422" do
    post "/api/profile/password",
      params: { current_password: "wrong", new_password: "newpass456", new_password_confirmation: "newpass456" },
      as: :json
    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "Current password is incorrect", json["error"]
  end

  # PATCH /api/profile/email — email change
  test "PATCH email sends confirmation" do
    patch "/api/profile/email", params: { email: "new@example.com" }, as: :json
    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal "Confirmation email sent. Please check your new inbox.", json["message"]
  end

  test "PATCH email rejects invalid format" do
    patch "/api/profile/email", params: { email: "not-an-email" }, as: :json
    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json.key?("errors")
  end
end
