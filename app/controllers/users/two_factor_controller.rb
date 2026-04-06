class Users::TwoFactorController < ApplicationController
  before_action :authenticate_user!

  # GET /users/two_factor/setup
  # Generates a TOTP secret and stores it in the session, returns provisioning URI for QR code.
  def setup
    secret = User.generate_otp_secret
    session[:pending_otp_secret] = secret

    provisioning_uri = current_user.otp_provisioning_uri(
      current_user.email,
      issuer: "BassLab",
      otp_secret_override: secret
    )
    qr = RQRCode::QRCode.new(provisioning_uri)

    render json: {
      provisioning_uri: provisioning_uri,
      qr_svg: qr.as_svg(offset: 0, color: "000", shape_rendering: "crispEdges", module_size: 4)
    }
  end

  # POST /users/two_factor/enable
  # Validates the OTP against the pending secret; on success, persists 2FA settings.
  def enable
    secret = session[:pending_otp_secret]
    unless secret
      render json: { error: "No pending 2FA setup" }, status: :unprocessable_entity
      return
    end

    # Temporarily assign secret so validate_and_consume_otp! can verify the code.
    current_user.otp_secret = secret
    if current_user.validate_and_consume_otp!(params[:otp_attempt].to_s)
      current_user.otp_required_for_login = true
      current_user.save!
      session.delete(:pending_otp_secret)
      render json: { message: "Two-factor authentication enabled." }
    else
      render json: { error: "Invalid verification code" }, status: :unprocessable_entity
    end
  end

  # DELETE /users/two_factor
  # Disables 2FA and clears the stored secret.
  def disable
    current_user.update!(otp_required_for_login: false, otp_secret: nil)
    render json: { message: "Two-factor authentication disabled." }
  end
end
