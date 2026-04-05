module Admin
  class AdminUsersController < Admin::ApplicationController
    before_action :require_super_admin!

    def index
      @resources = User.where(role: [ :staff, :super_admin ]).page(params[:page])
      @page = Administrate::Page::Collection.new(dashboard, order: order)
    end

    def show
      @resource = User.find(params[:id])
    end

    def new
      @resource = User.new
    end

    def create
      @resource = User.new(admin_user_params)
      if @resource.save
        redirect_to admin_admin_users_path, notice: "Admin user created."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
      @resource = User.find(params[:id])
    end

    def update
      @resource = User.find(params[:id])
      if @resource.update(admin_user_params)
        redirect_to admin_admin_users_path, notice: "Admin user updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      User.find(params[:id]).destroy
      redirect_to admin_admin_users_path, notice: "Admin user deleted."
    end

    private

    def require_super_admin!
      raise CanCan::AccessDenied unless current_user.super_admin?
    end

    def admin_user_params
      params.require(:user).permit(:email, :display_name, :role, :password, :password_confirmation)
    end

    def dashboard
      @dashboard ||= AdminUserDashboard.new
    end

    def order
      @order ||= Administrate::Order.new(params[:order], params[:direction])
    end
  end
end
