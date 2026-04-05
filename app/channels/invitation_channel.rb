class InvitationChannel < ApplicationCable::Channel
  def subscribed
    stream_from "invitation:#{current_user.id}"
  end

  def unsubscribed; end
end
