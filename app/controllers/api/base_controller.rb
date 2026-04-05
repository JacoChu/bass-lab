module Api
  class BaseController < ApplicationController
    protect_from_forgery with: :null_session
    before_action :authenticate_user!

    private

    def render_error(message, status)
      render json: { error: message }, status: status
    end
  end
end
