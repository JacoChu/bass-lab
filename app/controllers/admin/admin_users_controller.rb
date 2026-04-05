module Admin
  class AdminUsersController < Admin::ApplicationController
    before_action :set_resource, only: %i[show edit update destroy]

    def index
      @resources = User.all.order(:created_at).page(params[:page])
      @page = Administrate::Page::Collection.new(dashboard, order: order)
    end

    def show; end

    def edit; end

    def update
      if @resource.update(admin_user_params)
        redirect_to admin_admin_users_path, notice: "User updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @resource.destroy
      redirect_to admin_admin_users_path, notice: "User removed."
    end

    private

    def set_resource
      @resource = User.find(params[:id])
    end

    def admin_user_params
      params.require(:user).permit(:display_name, :role)
    end

    def dashboard
      @dashboard ||= AdminUserDashboard.new
    end

    def order
      @order ||= Administrate::Order.new(params[:order], params[:direction])
    end
  end
end
