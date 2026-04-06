class Users::SessionsController < Devise::SessionsController
  # POST /users/sign_in
  # Override to intercept users with 2FA enabled before completing sign-in.
  def create
    self.resource = warden.authenticate!(auth_options)
    set_flash_message!(:notice, :signed_in)

    if resource.otp_required_for_login?
      # Store user_id in session and redirect to OTP verification instead of signing in.
      session[:pending_2fa_user_id] = resource.id
      warden.logout
      render json: { two_factor_required: true, redirect_to: users_verify_otp_path }, status: :ok
    else
      sign_in(resource_name, resource)
      yield resource if block_given?
      respond_with resource, location: after_sign_in_path_for(resource)
    end
  end

  # POST /users/sessions/verify_otp
  # Validates the TOTP code and completes sign-in.
  def verify_otp
    user_id = session[:pending_2fa_user_id]
    unless user_id
      render json: { error: "No pending two-factor session" }, status: :unprocessable_entity
      return
    end

    user = User.find(user_id)
    if user.validate_and_consume_otp!(params[:otp_attempt].to_s)
      session.delete(:pending_2fa_user_id)
      sign_in(:user, user)
      render json: { message: "Signed in successfully." }
    else
      render json: { error: "Invalid two-factor code" }, status: :unprocessable_entity
    end
  end
end
