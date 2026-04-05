module Api
  class FriendRequestsController < Api::BaseController
    # GET /api/friends/requests
    def index
      requests = current_user.received_friendships.pending.map do |f|
        {
          id: f.id,
          requester_id: f.user_id,
          display_name: f.user.display_name,
          avatar_url: f.user.avatar_url,
          requested_at: f.requested_at
        }
      end
      render json: requests
    end

    # POST /api/friends/requests
    def create
      target = User.find_by(id: params[:friend_id])
      return render_error("User not found", :not_found) unless target
      return render_error("Cannot add yourself", :unprocessable_entity) if target.id == current_user.id

      friendship = current_user.sent_friendships.build(friend: target)
      if friendship.save
        render json: { id: friendship.id, status: friendship.status }, status: :created
      else
        render_error(friendship.errors.full_messages.first || "Friend request already sent", :unprocessable_entity)
      end
    end

    # POST /api/friends/requests/:id/accept
    def accept
      friendship = current_user.received_friendships.pending.find_by(id: params[:id])
      return render_error("Friend request not found", :not_found) unless friendship

      friendship.update!(status: :accepted)
      render json: { id: friendship.id, status: friendship.status }
    end

    # DELETE /api/friends/requests/:id  (reject)
    def destroy
      friendship = current_user.received_friendships.pending.find_by(id: params[:id])
      return render_error("Friend request not found", :not_found) unless friendship

      friendship.destroy
      head :no_content
    end
  end
end
