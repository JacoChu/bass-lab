import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DeviceSelector from '../components/DeviceSelector/DeviceSelector'
import { createConsumer } from '@rails/actioncable'

interface Friend {
  id: number
  display_name: string
  avatar_url: string | null
  online?: boolean
}

export default function LobbyPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const cableRef = useRef<ReturnType<typeof createConsumer> | null>(null)

  const [audioMuted, setAudioMuted] = useState(false)
  const [videoMuted, setVideoMuted] = useState(false)
  const [selectedAudioId, setSelectedAudioId] = useState('')
  const [selectedVideoId, setSelectedVideoId] = useState('')

  const [friends, setFriends] = useState<Friend[]>([])
  const [waitingFor, setWaitingFor] = useState<Friend | null>(null)
  const [expiredMsg, setExpiredMsg] = useState('')
  const waitingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Acquire camera preview
  const acquireStream = useCallback(async (audioId: string, videoId: string) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    try {
      const constraints: MediaStreamConstraints = {
        audio: audioId ? { deviceId: { exact: audioId } } : true,
        video: videoId ? { deviceId: { exact: videoId } } : true,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.warn('getUserMedia failed:', err)
    }
  }, [])

  useEffect(() => {
    acquireStream('', '')

    // Fetch friends list
    fetch('/api/friends', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: Friend[]) => setFriends(data.map((f) => ({ ...f, online: false }))))

    // Subscribe to PresenceChannel
    const cable = createConsumer('/cable')
    cableRef.current = cable

    cable.subscriptions.create('PresenceChannel', {
      received(data: { user_id: number; status: string }) {
        setFriends((prev) =>
          prev.map((f) =>
            f.id === data.user_id ? { ...f, online: data.status === 'online' } : f
          )
        )
      },
    })

    // Subscribe to InvitationChannel for acceptance notifications
    cable.subscriptions.create('InvitationChannel', {
      received(data: { accepted?: boolean; session_token?: string }) {
        if (data.accepted && data.session_token) {
          clearWaiting()
          navigate(`/call/${data.session_token}`)
        }
      },
    })

    return () => {
      // Lobby camera preview teardown — release hardware
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      cable.disconnect()
      if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function clearWaiting() {
    setWaitingFor(null)
    if (waitingTimerRef.current) {
      clearTimeout(waitingTimerRef.current)
      waitingTimerRef.current = null
    }
  }

  function toggleAudio() {
    if (!streamRef.current) return
    const track = streamRef.current.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setAudioMuted(!track.enabled)
    }
  }

  function toggleVideo() {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setVideoMuted(!track.enabled)
    }
  }

  function handleDevicesSelected({ audioDeviceId, videoDeviceId }: { audioDeviceId: string; videoDeviceId: string }) {
    setSelectedAudioId(audioDeviceId)
    setSelectedVideoId(videoDeviceId)
    acquireStream(audioDeviceId, videoDeviceId)
  }

  async function handleCall(friend: Friend) {
    setExpiredMsg('')
    const res = await fetch('/api/invitations', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitee_id: friend.id }),
    })
    if (!res.ok) {
      const data = await res.json()
      setExpiredMsg(data.error ?? '無法發送邀請')
      return
    }
    setWaitingFor(friend)
    // Auto-expire after 120 seconds
    waitingTimerRef.current = setTimeout(() => {
      setWaitingFor(null)
      setExpiredMsg('邀請已過期')
    }, 120_000)
  }

  const onlineFriends = friends.filter((f) => f.online)
  const offlineFriends = friends.filter((f) => !f.online)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">視訊大廳</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera preview */}
        <div className="space-y-4">
          <div className="card bg-base-200 p-3">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-lg bg-black aspect-video object-cover"
            />
            <div className="flex gap-2 mt-3 justify-center">
              <button
                className={`btn btn-sm ${audioMuted ? 'btn-error' : 'btn-outline'}`}
                onClick={toggleAudio}
                aria-label={audioMuted ? '解除靜音' : '靜音'}
              >
                {audioMuted ? '🔇 已靜音' : '🎤 麥克風'}
              </button>
              <button
                className={`btn btn-sm ${videoMuted ? 'btn-error' : 'btn-outline'}`}
                onClick={toggleVideo}
                aria-label={videoMuted ? '開啟攝影機' : '關閉攝影機'}
              >
                {videoMuted ? '📵 攝影機關' : '📹 攝影機'}
              </button>
            </div>
          </div>
          <DeviceSelector onDevicesSelected={handleDevicesSelected} />
        </div>

        {/* Friends list */}
        <div className="space-y-4">
          {waitingFor ? (
            <div className="card bg-base-200 p-4 text-center space-y-3">
              <p className="font-medium">等待 {waitingFor.display_name} 接受通話…</p>
              <span className="loading loading-dots loading-md" />
              <button className="btn btn-ghost btn-sm" onClick={clearWaiting}>
                取消
              </button>
            </div>
          ) : (
            <>
              {expiredMsg && (
                <div className="alert alert-warning text-sm">{expiredMsg}</div>
              )}

              {/* Online friends */}
              <div>
                <h2 className="font-semibold mb-2 text-success">在線 ({onlineFriends.length})</h2>
                {onlineFriends.length === 0 ? (
                  <p className="text-sm text-base-content/50">目前沒有好友在線</p>
                ) : (
                  <ul className="space-y-2">
                    {onlineFriends.map((f) => (
                      <li key={f.id} className="flex items-center justify-between card bg-base-200 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-success inline-block" />
                          <span>{f.display_name}</span>
                        </div>
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => handleCall(f)}
                        >
                          通話
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Offline friends */}
              {offlineFriends.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2 text-base-content/50">離線 ({offlineFriends.length})</h2>
                  <ul className="space-y-2">
                    {offlineFriends.map((f) => (
                      <li key={f.id} className="flex items-center gap-2 card bg-base-200 px-3 py-2 opacity-50">
                        <span className="w-2 h-2 rounded-full bg-base-content/30 inline-block" />
                        <span>{f.display_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
