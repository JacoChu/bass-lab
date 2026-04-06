module Api
  class SubscriptionsController < Api::BaseController
    # GET /api/subscriptions
    def index
      orders = current_user.orders.order(created_at: :desc)
      render json: orders.map { |o|
        {
          id: o.id,
          status: o.status,
          period: o.period,
          amount_cents: o.amount_cents,
          expires_at: o.expires_at&.strftime("%Y-%m-%d"),
          created_at: o.created_at.strftime("%Y-%m-%d")
        }
      }
    end

    # DELETE /api/subscriptions/:id
    def destroy
      order = current_user.orders.find_by(id: params[:id])
      return render json: { error: "Not found" }, status: :not_found unless order
      order.update!(status: :cancelled)
      render json: { message: "Subscription cancelled." }
    end
  end
end
