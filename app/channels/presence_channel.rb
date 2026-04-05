class PresenceChannel < ApplicationCable::Channel
  def subscribed
    stream_from "presence:#{current_user.id}"
    broadcast_to_friends(status: "online")
  end

  def unsubscribed
    broadcast_to_friends(status: "offline")
  end

  private

  def broadcast_to_friends(status:)
    accepted_friend_ids.each do |friend_id|
      ActionCable.server.broadcast(
        "presence:#{friend_id}",
        { user_id: current_user.id, status: status }
      )
    end
  end

  def accepted_friend_ids
    Friendship.accepted_for(current_user).map do |f|
      f.user_id == current_user.id ? f.friend_id : f.user_id
    end
  end
end
