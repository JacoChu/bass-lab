module Admin
  class AdminUsersController < Admin::ApplicationController
    before_action :set_user, only: %i[edit update]

    def index
      @users = User.all.order(:email)
    end

    def edit; end

    def update
      if @user.update(user_params)
        redirect_to admin_admin_users_path, notice: "角色已更新。"
      else
        render :edit, status: :unprocessable_entity
      end
    end

    private

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:role)
    end
  end
end
