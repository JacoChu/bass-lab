module Api
  class InvitationsController < Api::BaseController
    INVITATION_TTL = 120 # seconds

    # POST /api/invitations
    def create
      unless current_user.session_eligible?
        return render_error("No active subscription. Please subscribe to continue.", :forbidden)
      end

      invitee = User.find_by(id: params[:invitee_id])
      return render_error("User not found", :not_found) unless invitee
      return render_error("Cannot invite yourself", :unprocessable_entity) if invitee.id == current_user.id

      unless online?(invitee)
        return render_error("User is not online", :unprocessable_entity)
      end

      token = generate_session_token(inviter: current_user, invitee: invitee)

      ActionCable.server.broadcast(
        "invitation:#{invitee.id}",
        {
          from_user_id:    current_user.id,
          from_display_name: current_user.display_name,
          session_token:   token
        }
      )

      render json: { session_token: token }, status: :created
    end

    # POST /api/invitations/:token/accept
    def accept
      payload = decode_token(params[:token])
      return render_error("Invitation expired", :unprocessable_entity) unless payload

      render json: {
        media_server_url: "ws://localhost:8080/ws/signal",
        token: params[:token]
      }
    end

    private

    def online?(user)
      ActionCable.server.pubsub.respond_to?(:subscribers_for) ||
        online_users_set.include?(user.id.to_s)
    end

    def online_users_set
      # Solid Cable doesn't expose subscriber list directly; we track presence
      # via Redis-style key using Rails cache or a DB set. For now we rely on
      # the channel subscription — the broadcast will silently drop if not subscribed.
      # A more robust check can be added post-MVP.
      Set.new
    end

    def generate_session_token(inviter:, invitee:)
      payload = {
        inviter_id: inviter.id,
        invitee_id: invitee.id,
        exp: Time.current.to_i + INVITATION_TTL
      }
      JWT.encode(payload, Rails.application.secret_key_base, "HS256")
    end

    def decode_token(token)
      JWT.decode(token, Rails.application.secret_key_base, true, algorithm: "HS256").first
    rescue JWT::DecodeError, JWT::ExpiredSignature
      nil
    end
  end
end
