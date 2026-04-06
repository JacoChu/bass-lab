import { useEffect, useState, useCallback } from 'react'

interface DeviceSelection {
  audioDeviceId: string
  videoDeviceId: string
}

interface Props {
  onDevicesSelected: (selection: DeviceSelection) => void
}

export default function DeviceSelector({ onDevicesSelected }: Props) {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState('')
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState('')

  const enumerate = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const audio = devices.filter(d => d.kind === 'audioinput')
    const video = devices.filter(d => d.kind === 'videoinput')
    setAudioDevices(audio)
    setVideoDevices(video)
    // Default to first device if nothing selected yet.
    setSelectedAudioDeviceId(prev => prev || audio[0]?.deviceId || '')
    setSelectedVideoDeviceId(prev => prev || video[0]?.deviceId || '')
  }, [])

  useEffect(() => {
    void enumerate()
    navigator.mediaDevices.addEventListener('devicechange', enumerate)
    return () => { navigator.mediaDevices.removeEventListener('devicechange', enumerate) }
  }, [enumerate])

  function handleAudioChange(deviceId: string) {
    setSelectedAudioDeviceId(deviceId)
    onDevicesSelected({ audioDeviceId: deviceId, videoDeviceId: selectedVideoDeviceId })
  }

  function handleVideoChange(deviceId: string) {
    setSelectedVideoDeviceId(deviceId)
    onDevicesSelected({ audioDeviceId: selectedAudioDeviceId, videoDeviceId: deviceId })
  }

  function audioLabel(device: MediaDeviceInfo, index: number) {
    return device.label || `Microphone ${index + 1}`
  }

  function videoLabel(device: MediaDeviceInfo, index: number) {
    return device.label || `Camera ${index + 1}`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="form-control">
        <label className="label label-text" htmlFor="audio-select">Microphone</label>
        <select
          id="audio-select"
          aria-label="Microphone"
          className="select select-bordered"
          value={selectedAudioDeviceId}
          onChange={e => handleAudioChange(e.target.value)}
        >
          {audioDevices.map((d, i) => (
            <option key={d.deviceId} value={d.deviceId}>{audioLabel(d, i)}</option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label label-text" htmlFor="video-select">Camera</label>
        <select
          id="video-select"
          aria-label="Camera"
          className="select select-bordered"
          value={selectedVideoDeviceId}
          onChange={e => handleVideoChange(e.target.value)}
        >
          {videoDevices.map((d, i) => (
            <option key={d.deviceId} value={d.deviceId}>{videoLabel(d, i)}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
