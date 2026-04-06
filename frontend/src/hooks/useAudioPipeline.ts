import { useEffect, useRef, useState } from 'react'

interface AudioPipelineOptions {
  audioDeviceId: string
  videoDeviceId: string
}

interface AudioPipelineResult {
  /** The processed MediaStream to feed into RTCPeerConnection. */
  stream: MediaStream | null
  /** Non-null when the selected device is unavailable. */
  deviceError: string | null
}

/**
 * useAudioPipeline — tasks 8.1–8.4
 *
 * Acquires getUserMedia with DSP disabled, runs the audio through a
 * Web Audio API pipeline (GainNode ×5 + ChannelSplitter/Merger for
 * mono-to-stereo), and returns the processed stream.
 * Tears down the AudioContext and stops all tracks on unmount.
 */
export function useAudioPipeline(options: AudioPipelineOptions): AudioPipelineResult {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [deviceError, setDeviceError] = useState<string | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const tracksRef = useRef<MediaStreamTrack[]>([])

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        // Task 8.1 — disable browser DSP processing.
        const raw = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: options.audioDeviceId ? { exact: options.audioDeviceId } : undefined,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          video: options.videoDeviceId ? { deviceId: { exact: options.videoDeviceId } } : true,
        })

        if (cancelled) {
          raw.getTracks().forEach(t => t.stop())
          return
        }

        tracksRef.current = raw.getTracks()
        setDeviceError(null)

        // Task 8.2 — build Web Audio API processing graph.
        const ctx = new AudioContext()
        audioCtxRef.current = ctx

        const source = ctx.createMediaStreamSource(raw)

        // GainNode: pre-amp gain ×5 (task 8.2).
        const gain = ctx.createGain()
        gain.gain.value = 5

        // ChannelSplitter + ChannelMerger: mono → stereo (task 8.3).
        // Takes channel 0 (left) from the mono input and copies it to both
        // merger inputs so both output channels carry the same signal.
        const splitter = ctx.createChannelSplitter(2)
        const merger = ctx.createChannelMerger(2)

        source.connect(gain)
        gain.connect(splitter)
        // Task 8.3 — output[0] → merger input[0] AND input[1].
        splitter.connect(merger, 0, 0)
        splitter.connect(merger, 0, 1)

        const destination = ctx.createMediaStreamDestination()
        merger.connect(destination)

        setStream(destination.stream)
      } catch (err) {
        if (cancelled) return
        if ((err instanceof DOMException && err.name === 'OverconstrainedError') ||
            (err != null && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'OverconstrainedError')) {
          setDeviceError('Selected device is no longer available. Please choose another.')
        } else {
          console.warn('DSP constraint not honored by browser', err)
        }
      }
    }

    void start()

    // Task 8.4 — teardown on unmount.
    return () => {
      cancelled = true
      tracksRef.current.forEach(t => t.stop())
      tracksRef.current = []
      if (audioCtxRef.current) {
        void audioCtxRef.current.close()
        audioCtxRef.current = null
      }
      setStream(null)
    }
  }, [options.audioDeviceId, options.videoDeviceId])

  return { stream, deviceError }
}
