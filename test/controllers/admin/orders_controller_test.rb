require "test_helper"

class Admin::OrdersControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = User.create!(
      email: "admin@example.com",
      password: "password123",
      display_name: "Admin",
      role: :super_admin
    )
    @target_user = User.create!(
      email: "user@example.com",
      password: "password123",
      display_name: "Target User",
      role: :user
    )
    sign_in @admin
  end

  test "GET new pre-fills user_id and defaults status to confirmed" do
    get new_admin_order_path(user_id: @target_user.id)
    assert_response :success
    assert_select "input[name='order[user_id]'][value='#{@target_user.id}']"
    assert_select "input[name='order[status]'][value='confirmed']"
  end

  test "POST create with valid params creates order and redirects" do
    assert_difference "Order.count", 1 do
      post admin_orders_path, params: {
        order: {
          user_id: @target_user.id,
          status: "confirmed",
          period: "monthly",
          amount_cents: 99000,
          expires_at: 1.month.from_now.strftime("%Y-%m-%dT%H:%M")
        }
      }
    end
    order = Order.last
    assert_equal @target_user.id, order.user_id
    assert order.confirmed?
    assert_redirected_to admin_order_path(order)
  end

  test "POST create without expires_at re-renders form" do
    assert_no_difference "Order.count" do
      post admin_orders_path, params: {
        order: {
          user_id: @target_user.id,
          status: "confirmed",
          period: "monthly",
          amount_cents: 99000,
          expires_at: ""
        }
      }
    end
    assert_response :unprocessable_entity
  end
end
