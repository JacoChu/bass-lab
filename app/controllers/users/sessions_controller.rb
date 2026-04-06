class Users::SessionsController < Devise::SessionsController
  # POST /users/sign_in
  # Manual credential check to avoid devise-two-factor strategy blocking password-only logins.
  def create
    user = User.find_by(email: params.dig(:user, :email))
    if user&.valid_password?(params.dig(:user, :password))
      if user.otp_required_for_login?
        session[:pending_2fa_user_id] = user.id
        render json: { two_factor_required: true }
      else
        sign_in(:user, user)
        render json: { message: "Signed in successfully." }
      end
    else
      render json: { error: "Invalid email or password" }, status: :unprocessable_entity
    end
  end
end
