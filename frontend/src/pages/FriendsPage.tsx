import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createConsumer } from '@rails/actioncable'

interface Friend {
  user_id: number
  display_name: string
  avatar_url: string | null
}

interface InvitationChannelMsg {
  from_user_id?: number
  from_display_name?: string
  session_token?: string
  accepted?: boolean
  go_server_url?: string
}

export default function FriendsPage() {
  const navigate = useNavigate()
  const [friends, setFriends] = useState<Friend[]>([])
  const [onlineIds, setOnlineIds] = useState<Set<number>>(new Set())
  const [callingToken, setCallingToken] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [incomingInvite, setIncomingInvite] = useState<{
    fromDisplayName: string
    sessionToken: string
  } | null>(null)

  // Fetch friend list on mount.
  useEffect(() => {
    void fetch('/api/friends')
      .then(r => r.json())
      .then((data: Friend[]) => setFriends(data))
  }, [])

  // ActionCable subscriptions: PresenceChannel + InvitationChannel.
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
      received(data: InvitationChannelMsg) {
        if (data.accepted && data.session_token) {
          // Our outgoing invitation was accepted — navigate to the call page.
          navigate('/call/' + data.session_token, {
            state: { goServerUrl: data.go_server_url ?? '' },
          })
        } else if (data.from_user_id && data.session_token) {
          // Incoming invitation from another user.
          setIncomingInvite({
            fromDisplayName: data.from_display_name ?? 'Someone',
            sessionToken: data.session_token,
          })
        }
      },
    })

    return () => {
      presenceSub.unsubscribe()
      invitationSub.unsubscribe()
    }
  }, [navigate])

  // Start a call: POST /api/invitations, show waiting state, 120s timeout.
  const handleCall = useCallback(async (toUserId: number) => {
    setInviteError(null)
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitee_id: toUserId }),
      })
      const data = await res.json() as { session_token?: string; error?: string }
      if (!res.ok) {
        setInviteError(data.error ?? 'Failed to send invitation')
        return
      }
      const token = data.session_token ?? null
      setCallingToken(token)
      // Auto-expire after 120s if no acceptance received.
      if (token) {
        setTimeout(() => {
          setCallingToken(prev => {
            if (prev === token) {
              setInviteError('邀請已過期')
              return null
            }
            return prev
          })
        }, 120_000)
      }
    } catch {
      setInviteError('Network error')
    }
  }, [])

  // Accept incoming invitation: navigate to call page (CallPage calls accept API).
  const handleAcceptInvite = useCallback(() => {
    if (!incomingInvite) return
    const token = incomingInvite.sessionToken
    setIncomingInvite(null)
    navigate('/call/' + token)
  }, [incomingInvite, navigate])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Friends</h1>

      {inviteError && (
        <div className="alert alert-error mb-4 text-sm">{inviteError}</div>
      )}

      {/* Incoming invitation modal */}
      {incomingInvite && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold">{incomingInvite.fromDisplayName} 想要視訊通話</h3>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleAcceptInvite}>接受</button>
              <button className="btn btn-ghost" onClick={() => setIncomingInvite(null)}>拒絕</button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting for acceptance */}
      {callingToken && (
        <div className="alert alert-info mb-4 text-sm">
          等待對方接受…（120 秒後自動取消）
          <button
            className="btn btn-xs ml-2"
            onClick={() => setCallingToken(null)}
          >
            取消
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {friends.map(f => (
          <li
            key={f.user_id}
            className="flex items-center gap-3 p-2 rounded border border-base-300"
          >
            <span
              data-testid={`status-${f.user_id}`}
              data-status={onlineIds.has(f.user_id) ? 'online' : 'offline'}
              className={`w-2.5 h-2.5 rounded-full ${
                onlineIds.has(f.user_id) ? 'bg-success' : 'bg-base-300'
              }`}
            />
            <span className="flex-1">{f.display_name}</span>
            {onlineIds.has(f.user_id) && !callingToken && (
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
