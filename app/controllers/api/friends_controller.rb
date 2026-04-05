module Api
  class FriendsController < Api::BaseController
    # GET /api/friends
    def index
      friendships = Friendship.accepted_for(current_user)
      friends = friendships.map do |f|
        other = f.user_id == current_user.id ? f.friend : f.user
        { user_id: other.id, display_name: other.display_name, avatar_url: other.avatar_url }
      end
      render json: friends
    end

    # DELETE /api/friends/:id
    def destroy
      friendship = Friendship.accepted_for(current_user).find_by(id: params[:id])
      return render_error("Friendship not found", :not_found) unless friendship

      friendship.destroy
      render json: { message: "Friend removed." }
    end
  end
end
