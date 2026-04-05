module Admin
  class ApplicationController < ApplicationController
    layout "admin"
    before_action :authenticate_admin!

    private

    def authenticate_admin!
      unless user_signed_in? && current_user.super_admin?
        redirect_to new_admin_session_path, alert: "請先以管理員帳號登入。"
      end
    end
  end
end
