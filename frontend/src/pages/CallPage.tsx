import { useEffect, useRef, useState } from 'react'
import DeviceSelector from '../components/DeviceSelector/DeviceSelector'
import { useAudioPipeline } from '../hooks/useAudioPipeline'

interface Props {
  goServerUrl: string
  sessionToken: string
  onHangUp: () => void
}

interface SignalMsg {
  type: string
  sdp?: string
  candidate?: string
}

/**
 * CallPage — tasks 9.4 + 9.5
 *
 * Connects to the Go WebSocket media server, performs WebRTC offer/answer
 * signaling, and forwards the processed audio track from useAudioPipeline.
 * Embeds DeviceSelector so the user can switch devices before/during a call.
 */
export default function CallPage({ goServerUrl, sessionToken, onHangUp }: Props) {
  const [deviceIds, setDeviceIds] = useState({ audioDeviceId: '', videoDeviceId: '' })
  const { stream } = useAudioPipeline(deviceIds)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    const ws = new WebSocket(`${goServerUrl}?token=${sessionToken}`)
    wsRef.current = ws

    const pc = new RTCPeerConnection()
    pcRef.current = pc

    // Forward remote tracks to the video element.
    pc.ontrack = (ev) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = ev.streams[0] ?? null
      }
    }

    // Send ICE candidates to the Go server.
    pc.onicecandidate = (ev) => {
      if (ev.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'candidate', candidate: ev.candidate.candidate }))
      }
    }

    ws.addEventListener('open', async () => {
      // Create and send SDP offer.
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
  }, [goServerUrl, sessionToken])

  // Add processed audio track to the PeerConnection when the pipeline is ready.
  useEffect(() => {
    if (!stream || !pcRef.current) return
    stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream))
  }, [stream])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold flex-1">通話中</h1>
        <button className="btn btn-error btn-sm" onClick={onHangUp}>掛斷</button>
      </div>

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full rounded-lg bg-black aspect-video"
      />

      {/* Task 9.5 — embed DeviceSelector */}
      <DeviceSelector
        onDevicesSelected={sel => setDeviceIds({ audioDeviceId: sel.audioDeviceId, videoDeviceId: sel.videoDeviceId })}
      />
    </div>
  )
}
