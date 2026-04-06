require "test_helper"

class Api::SubscriptionsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = User.create!(email: "sub_user@example.com", password: "password123", display_name: "Sub User", role: :user)
    sign_in @user
    @order = @user.orders.create!(status: :confirmed, amount_cents: 50000, period: :monthly, expires_at: 1.month.from_now)
  end

  test "GET index returns orders as JSON" do
    get "/api/subscriptions", as: :json
    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal 1, json.length
    assert_equal @order.id, json.first["id"]
    assert_equal "confirmed", json.first["status"]
    assert_equal "monthly", json.first["period"]
  end

  test "GET index returns empty array when no orders" do
    @order.destroy
    get "/api/subscriptions", as: :json
    assert_response :ok
    assert_equal [], JSON.parse(response.body)
  end

  test "DELETE destroy cancels a confirmed order" do
    delete "/api/subscriptions/#{@order.id}", as: :json
    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal "Subscription cancelled.", json["message"]
    assert_equal "cancelled", @order.reload.status
  end

  test "DELETE destroy returns 404 for unknown order" do
    delete "/api/subscriptions/99999", as: :json
    assert_response :not_found
  end

  test "DELETE destroy cannot cancel another user's order" do
    other_user = User.create!(email: "other@example.com", password: "password123", display_name: "Other", role: :user)
    other_order = other_user.orders.create!(status: :confirmed, amount_cents: 50000, period: :monthly, expires_at: 1.month.from_now)
    delete "/api/subscriptions/#{other_order.id}", as: :json
    assert_response :not_found
  end
end
