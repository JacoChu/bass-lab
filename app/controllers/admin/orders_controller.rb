module Admin
  class OrdersController < Admin::ApplicationController
    before_action :set_order, only: %i[show edit update]

    def index
      @orders = Order.includes(:user).order(created_at: :desc)
      @orders = @orders.where(status: params[:status]) if params[:status].present?
      if params[:created_from].present?
        @orders = @orders.where("created_at >= ?", Date.parse(params[:created_from]).beginning_of_day)
      end
      if params[:created_to].present?
        @orders = @orders.where("created_at <= ?", Date.parse(params[:created_to]).end_of_day)
      end
    end

    def show; end

    def new
      @user = User.find(params[:user_id])
      @order = Order.new(user_id: @user.id, status: :confirmed)
    end

    def create
      @order = Order.new(create_params)
      if @order.save
        redirect_to admin_order_path(@order), notice: "訂閱已建立。"
      else
        @user = User.find_by(id: @order.user_id)
        render :new, status: :unprocessable_entity
      end
    end

    def edit; end

    def update
      if @order.update(order_params)
        redirect_to admin_order_path(@order), notice: "訂單已更新。"
      else
        render :edit, status: :unprocessable_entity
      end
    end

    private

    def set_order
      @order = Order.find(params[:id])
    end

    def create_params
      params.require(:order).permit(:user_id, :status, :period, :amount_cents, :expires_at)
    end

    def order_params
      params.require(:order).permit(:status, :period, :expires_at)
    end
  end
end
