module Admin
  class ApplicationController < Administrate::ApplicationController
    before_action :authenticate_admin!

    rescue_from CanCan::AccessDenied do
      render plain: "403 Forbidden", status: :forbidden
    end

    private

    def authenticate_admin!
      unless user_signed_in? && current_user.super_admin?
        render plain: "403 Forbidden", status: :forbidden
      end
    end

    def current_ability
      @current_ability ||= Ability.new(current_user)
    end
  end
end
