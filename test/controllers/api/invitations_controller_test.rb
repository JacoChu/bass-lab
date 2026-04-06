require "test_helper"

class Api::InvitationsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @inviter = User.create!(email: "inviter@example.com", password: "password123", display_name: "Inviter", role: :user)
    @invitee = User.create!(email: "invitee@example.com", password: "password123", display_name: "Invitee", role: :user)
    sign_in @inviter
  end

  test "POST create blocked when inviter has no subscription and exhausted trials" do
    @inviter.update!(trial_sessions_used: 2)
    post "/api/invitations", params: { invitee_id: @invitee.id }, as: :json
    assert_response :forbidden
    json = JSON.parse(response.body)
    assert_equal "No active subscription. Please subscribe to continue.", json["error"]
  end

  test "POST create allowed when inviter has trial sessions remaining" do
    @inviter.update!(trial_sessions_used: 0)
    # invitee not tracked as online in test, so will hit "not online" — but eligibility check passes first
    post "/api/invitations", params: { invitee_id: @invitee.id }, as: :json
    # Should not be forbidden (403)
    assert_not_equal 403, response.status
  end

  test "POST create allowed when inviter has active subscription" do
    @inviter.orders.create!(
      status: :confirmed, amount_cents: 50000, period: :monthly,
      expires_at: 1.month.from_now
    )
    @inviter.update!(trial_sessions_used: 2)
    post "/api/invitations", params: { invitee_id: @invitee.id }, as: :json
    assert_not_equal 403, response.status
  end
end
