class Users::OtpSessionsController < ApplicationController
  include Devise::Controllers::Helpers
  protect_from_forgery with: :null_session

  # POST /users/sessions/verify_otp
  # Validates the TOTP code and completes sign-in for users with 2FA enabled.
  def create
    user_id = session[:pending_2fa_user_id]
    unless user_id
      render json: { error: "No pending two-factor session" }, status: :unprocessable_entity
      return
    end

    user = User.find_by(id: user_id)
    unless user
      render json: { error: "No pending two-factor session" }, status: :unprocessable_entity
      return
    end

    if user.validate_and_consume_otp!(params[:otp_attempt].to_s)
      session.delete(:pending_2fa_user_id)
      sign_in(:user, user)
      render json: { message: "Signed in successfully." }
    else
      render json: { error: "Invalid two-factor code" }, status: :unprocessable_entity
    end
  end
end
