import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import DeviceSelector from '../components/DeviceSelector/DeviceSelector'
import { useAudioPipeline } from '../hooks/useAudioPipeline'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface SignalMsg {
  type: string
  sdp?: string
  candidate?: string
}

/**
 * CallPage — tasks 9.4 + 9.5
 *
 * Route: /call/:token
 *
 * If location.state.goServerUrl is present (invitor, notified via InvitationChannel),
 * connect directly. Otherwise call POST /api/invitations/:token/accept (invitee)
 * to retrieve the Go server URL, then establish the WebRTC connection.
 */
export default function CallPage() {
  const { token } = useParams<{ token: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const stateGoServerUrl = (location.state as { goServerUrl?: string } | null)?.goServerUrl ?? ''
  const [goServerUrl, setGoServerUrl] = useState(stateGoServerUrl)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [deviceIds, setDeviceIds] = useState({ audioDeviceId: '', videoDeviceId: '' })

  const { stream } = useAudioPipeline(deviceIds)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  // If no goServerUrl in state, call accept API to obtain it.
  useEffect(() => {
    if (goServerUrl || !token) return
    void (async () => {
      const res = await fetch(`/api/invitations/${token}/accept`, { method: 'POST' })
      const data = await res.json() as { go_server_url?: string; error?: string }
      if (res.ok && data.go_server_url) {
        setGoServerUrl(data.go_server_url)
      } else {
        setStatus('disconnected')
      }
    })()
  }, [token, goServerUrl])

  // Establish WebRTC + WebSocket connection once go_server_url is known.
  useEffect(() => {
    if (!goServerUrl || !token) return

    const ws = new WebSocket(`${goServerUrl}?token=${token}`)
    wsRef.current = ws

    const pc = new RTCPeerConnection()
    pcRef.current = pc

    pc.ontrack = (ev) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = ev.streams[0] ?? null
      }
      setStatus('connected')
    }

    pc.onicecandidate = (ev) => {
      if (ev.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'candidate', candidate: ev.candidate.candidate }))
      }
    }

    ws.addEventListener('open', async () => {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }))
    })

    ws.addEventListener('message', async (ev: MessageEvent) => {
      const msg = JSON.parse(ev.data as string) as SignalMsg
      if (msg.type === 'answer' && msg.sdp) {
        await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp })
      } else if (msg.type === 'candidate' && msg.candidate) {
        await pc.addIceCandidate({ candidate: msg.candidate })
      }
    })

    return () => {
      ws.close()
      pc.close()
    }
  }, [goServerUrl, token])

  // Add processed audio track once the pipeline is ready.
  useEffect(() => {
    if (!stream || !pcRef.current) return
    stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream))
  }, [stream])

  function hangUp() {
    wsRef.current?.close()
    pcRef.current?.close()
    navigate('/friends')
  }

  const statusLabel =
    status === 'connecting' ? 'Connecting…'
    : status === 'connected' ? 'Connected'
    : 'Disconnected'

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold flex-1">通話中</h1>
        <span data-testid="connection-status" className="text-sm text-gray-500">
          {statusLabel}
        </span>
        <button className="btn btn-error btn-sm" onClick={hangUp}>掛斷</button>
      </div>

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full rounded-lg bg-black aspect-video"
      />

      {/* Task 9.5 — embed DeviceSelector; cleanup handled by useAudioPipeline on unmount */}
      <DeviceSelector
        onDevicesSelected={sel =>
          setDeviceIds({ audioDeviceId: sel.audioDeviceId, videoDeviceId: sel.videoDeviceId })
        }
      />
    </div>
  )
}
