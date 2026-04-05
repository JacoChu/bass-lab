module Admin
  class UsersController < Admin::ApplicationController
    before_action :set_user, only: %i[show edit update destroy]

    def index
      @users = User.all.order(:created_at)
    end

    def show
      @orders  = @user.orders.order(created_at: :desc)
      @friends = @user.accepted_friends
    end

    def new
      @user = User.new
    end

    def create
      @user = User.new(create_params)
      if @user.save
        redirect_to admin_user_path(@user), notice: "使用者已建立。"
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit; end

    def update
      if @user.update(update_params)
        redirect_to admin_user_path(@user), notice: "使用者已更新。"
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @user.destroy
      redirect_to admin_users_path, notice: "使用者已刪除。"
    end

    private

    def set_user
      @user = User.find(params[:id])
    end

    def create_params
      params.require(:user).permit(:email, :display_name, :role, :password, :password_confirmation)
    end

    def update_params
      params.require(:user).permit(:display_name, :role)
    end
  end
end
