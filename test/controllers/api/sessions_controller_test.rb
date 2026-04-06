require "test_helper"

class Api::SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @inviter = User.create!(email: "inviter@sess.com", password: "password123", display_name: "Inviter", role: :user, trial_sessions_used: 0)
    @invitee = User.create!(email: "invitee@sess.com", password: "password123", display_name: "Invitee", role: :user)

    payload = { inviter_id: @inviter.id, invitee_id: @invitee.id, exp: 10.minutes.from_now.to_i }
    @token = JWT.encode(payload, Rails.application.secret_key_base, "HS256")
  end

  test "DELETE session increments trial_sessions_used for trial inviter" do
    @inviter.update!(trial_sessions_used: 0)
    delete "/api/sessions/#{@token}"
    assert_response :ok
    assert_equal 1, @inviter.reload.trial_sessions_used
  end

  test "DELETE session does not increment when inviter has active subscription" do
    @inviter.orders.create!(status: :confirmed, amount_cents: 50000, period: :monthly, expires_at: 1.month.from_now)
    @inviter.update!(trial_sessions_used: 0)
    delete "/api/sessions/#{@token}"
    assert_response :ok
    assert_equal 0, @inviter.reload.trial_sessions_used
  end

  test "DELETE session returns 422 for invalid token" do
    delete "/api/sessions/bad_token"
    assert_response :unprocessable_entity
  end
end
