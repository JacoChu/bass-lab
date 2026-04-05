module Api
  class SessionsController < ApplicationController
    protect_from_forgery with: :null_session

    # GET /api/sessions/validate?token=...
    # Called by the Go media server to verify session tokens.
    # No user auth required — Go server calls this internally.
    def validate
      token = params[:token]
      payload = decode_token(token)

      unless payload
        return render json: { valid: false }, status: :unauthorized
      end

      inviter = User.find_by(id: payload["inviter_id"])
      invitee = User.find_by(id: payload["invitee_id"])

      unless inviter && invitee
        return render json: { valid: false }, status: :unauthorized
      end

      trial = !inviter.active_subscription?

      render json: {
        valid: true,
        session_id: token,
        inviter_id: inviter.id,
        invitee_id: invitee.id,
        trial: trial
      }
    end

    private

    def decode_token(token)
      return nil if token.blank?
      JWT.decode(token, Rails.application.secret_key_base, true, algorithm: "HS256").first
    rescue JWT::DecodeError, JWT::ExpiredSignature
      nil
    end
  end
end
