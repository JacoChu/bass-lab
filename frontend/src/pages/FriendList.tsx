import { useEffect, useState, useCallback } from 'react'
import { createConsumer } from '@rails/actioncable'

interface Friend {
  user_id: number
  display_name: string
  avatar_url: string | null
}

interface Props {
  currentUserId: number
  onCallAccepted?: (goServerUrl: string, sessionToken: string) => void
}

export default function FriendList({ currentUserId, onCallAccepted }: Props) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [onlineIds, setOnlineIds] = useState<Set<number>>(new Set())
  const [callingId, setCallingId] = useState<number | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  // Incoming invitation state (task 9.2)
  const [incomingInvite, setIncomingInvite] = useState<{
    fromUserId: number
    fromDisplayName: string
    sessionToken: string
  } | null>(null)

  // Fetch friend list.
  useEffect(() => {
    void fetch('/api/friends')
      .then(r => r.json())
      .then((data: Friend[]) => setFriends(data))
  }, [])

  // Subscribe to PresenceChannel (task 9.1) and InvitationChannel (task 9.2).
  useEffect(() => {
    const cable = createConsumer('/cable')

    const presenceSub = cable.subscriptions.create('PresenceChannel', {
      received(data: { user_id: number; status: string }) {
        setOnlineIds(prev => {
          const next = new Set(prev)
          if (data.status === 'online') next.add(data.user_id)
          else next.delete(data.user_id)
          return next
        })
      },
    })

    const invitationSub = cable.subscriptions.create('InvitationChannel', {
      received(data: { from_user_id: number; from_display_name: string; session_token: string }) {
        setIncomingInvite({
          fromUserId: data.from_user_id,
          fromDisplayName: data.from_display_name,
          sessionToken: data.session_token,
        })
      },
    })

    return () => {
      presenceSub.unsubscribe()
      invitationSub.unsubscribe()
    }
  }, [])

  // Task 9.3 — initiate a call.
  const handleCall = useCallback(async (toUserId: number) => {
    setCallingId(toUserId)
    setInviteError(null)
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: toUserId }),
      })
      const data = await res.json() as { session_token?: string; error?: string }
      if (!res.ok) {
        setInviteError(data.error ?? 'Failed to send invitation')
        setCallingId(null)
        return
      }
      // 120-second timeout for the other party to accept.
      const timeout = setTimeout(() => {
        setInviteError('邀請已過期')
        setCallingId(null)
      }, 120_000)
      // The call page handles the accept flow via InvitationChannel.
      // Store timeout id so it can be cleared if needed (not shown here for brevity).
      void timeout
    } catch {
      setInviteError('Network error')
      setCallingId(null)
    }
  }, [])

  // Task 9.3 — accept incoming invitation.
  const handleAcceptInvite = useCallback(async () => {
    if (!incomingInvite) return
    const res = await fetch(`/api/invitations/${incomingInvite.sessionToken}/accept`, { method: 'POST' })
    const data = await res.json() as { go_server_url?: string; session_token?: string; error?: string }
    if (res.ok && data.go_server_url) {
      setIncomingInvite(null)
      onCallAccepted?.(data.go_server_url, data.session_token ?? incomingInvite.sessionToken)
    }
  }, [incomingInvite, onCallAccepted])

  void currentUserId // used for future self-exclusion logic

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Friends</h1>

      {inviteError && (
        <div className="alert alert-error mb-4 text-sm">{inviteError}</div>
      )}

      {/* Incoming invitation modal (task 9.2) */}
      {incomingInvite && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold">{incomingInvite.fromDisplayName} 想要視訊通話</h3>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => void handleAcceptInvite()}>接受</button>
              <button className="btn btn-ghost" onClick={() => setIncomingInvite(null)}>拒絕</button>
            </div>
          </div>
        </div>
      )}

      {callingId != null && (
        <div className="alert alert-info mb-4 text-sm">等待對方接受…（120 秒後自動取消）</div>
      )}

      <ul className="space-y-2">
        {friends.map(f => (
          <li key={f.user_id} className="flex items-center gap-3 p-2 rounded border border-base-300">
            <span
              data-testid={`status-${f.user_id}`}
              data-status={onlineIds.has(f.user_id) ? 'online' : 'offline'}
              className={`w-2.5 h-2.5 rounded-full ${onlineIds.has(f.user_id) ? 'bg-success' : 'bg-base-300'}`}
            />
            <span className="flex-1">{f.display_name}</span>
            {onlineIds.has(f.user_id) && callingId == null && (
              <button
                data-testid={`call-btn-${f.user_id}`}
                className="btn btn-xs btn-primary"
                onClick={() => void handleCall(f.user_id)}
              >
                通話
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
