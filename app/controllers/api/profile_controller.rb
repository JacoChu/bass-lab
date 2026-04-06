module Api
  class ProfileController < Api::BaseController
    # GET /api/profile
    def show
      render json: {
        display_name: current_user.display_name,
        email: current_user.email,
        trial_sessions_used: current_user.trial_sessions_used,
        otp_required_for_login: current_user.otp_required_for_login
      }
    end

    # PATCH /api/profile — display_name update only
    def update
      if current_user.update(display_name: params[:display_name])
        render json: {
          display_name: current_user.display_name,
          email: current_user.email,
          trial_sessions_used: current_user.trial_sessions_used,
          otp_required_for_login: current_user.otp_required_for_login
        }
      else
        render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # POST /api/profile/password
    def password
      unless current_user.valid_password?(params[:current_password])
        return render json: { error: "Current password is incorrect" }, status: :unprocessable_entity
      end
      current_user.update!(password: params[:new_password])
      render json: { message: "Password updated successfully." }
    end

    # PATCH /api/profile/email
    def email
      new_email = params[:email].to_s.strip
      unless new_email.match?(/\A[^@\s]+@[^@\s]+\z/)
        return render json: { errors: ["Email is invalid"] }, status: :unprocessable_entity
      end
      # Devise confirmable: updating email sets unconfirmed_email and sends confirmation mail.
      if current_user.update(email: new_email)
        render json: { message: "Confirmation email sent. Please check your new inbox." }
      else
        render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end
