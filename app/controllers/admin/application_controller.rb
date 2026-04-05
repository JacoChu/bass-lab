module Admin
  class ApplicationController < Administrate::ApplicationController
    before_action :authenticate_admin!

    private

    def authenticate_admin!
      unless user_signed_in? && (current_user.staff? || current_user.super_admin?)
        redirect_to new_admin_session_path, alert: "Invalid email or password"
      end
    end

    def after_sign_in_path_for(resource)
      admin_root_path
    end
  end
end
