import { renderHook, act, waitFor } from '@testing-library/react'
import { useAudioPipeline } from './useAudioPipeline'

// Minimal Web Audio API mock for jsdom.
function buildAudioContextMock() {
  const destination = { stream: {} as MediaStream }
  const merger = { connect: vi.fn(), numberOfInputs: 2 }
  const splitter = { connect: vi.fn() }
  const gainNode = { connect: vi.fn(), gain: { value: 1 } }
  const source = { connect: vi.fn() }
  const ctx = {
    createMediaStreamSource: vi.fn().mockReturnValue(source),
    createGain: vi.fn().mockReturnValue(gainNode),
    createChannelSplitter: vi.fn().mockReturnValue(splitter),
    createChannelMerger: vi.fn().mockReturnValue(merger),
    createMediaStreamDestination: vi.fn().mockReturnValue(destination),
    close: vi.fn().mockResolvedValue(undefined),
    state: 'running',
  }
  return { ctx, source, gainNode, splitter, merger, destination }
}

function buildGetUserMediaMock(constraints?: MediaStreamConstraints) {
  const tracks = [{ stop: vi.fn(), kind: 'audio' }]
  const stream = { getTracks: () => tracks } as unknown as MediaStream
  const getUserMedia = vi.fn().mockResolvedValue(stream)
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia },
    writable: true,
    configurable: true,
  })
  return { getUserMedia, stream, tracks }
}

test('calls getUserMedia with DSP disabled', async () => {
  const { getUserMedia } = buildGetUserMediaMock()
  const { ctx } = buildAudioContextMock()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.stubGlobal('AudioContext', function MockAC(this: any) { Object.assign(this, ctx) })

  const { result } = renderHook(() => useAudioPipeline({ audioDeviceId: 'mic-1', videoDeviceId: 'cam-1' }))
  await waitFor(() => expect(getUserMedia).toHaveBeenCalled())

  const constraints = getUserMedia.mock.calls[0][0] as MediaStreamConstraints
  const audio = constraints.audio as MediaTrackConstraints
  expect(audio.echoCancellation).toBe(false)
  expect(audio.noiseSuppression).toBe(false)
  expect(audio.autoGainControl).toBe(false)
  void result
})

test('pipeline teardown stops tracks and closes AudioContext', async () => {
  const { tracks, getUserMedia } = buildGetUserMediaMock()
  const { ctx } = buildAudioContextMock()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.stubGlobal('AudioContext', function MockAC(this: any) { Object.assign(this, ctx) })

  const { unmount } = renderHook(() => useAudioPipeline({ audioDeviceId: 'mic-1', videoDeviceId: 'cam-1' }))
  // Wait until getUserMedia has been called (hook's async pipeline started).
  await waitFor(() => expect(getUserMedia).toHaveBeenCalled())
  // Allow remaining microtasks (AudioContext setup) to complete.
  await act(async () => { await new Promise(r => setTimeout(r, 20)) })
  unmount()

  expect(tracks[0].stop).toHaveBeenCalled()
  expect(ctx.close).toHaveBeenCalled()
})
