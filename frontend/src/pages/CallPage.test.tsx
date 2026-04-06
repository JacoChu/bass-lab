import { render, screen, waitFor } from '@testing-library/react'
import CallPage from './CallPage'

// Minimal RTCPeerConnection mock.
const mockPc = {
  addTrack: vi.fn(),
  createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'v=0' }),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  addIceCandidate: vi.fn().mockResolvedValue(undefined),
  onicecandidate: null as unknown,
  ontrack: null as unknown,
  close: vi.fn(),
}

let mockWsHandlers: Record<string, Function> = {}
const mockWs = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn((ev: string, cb: Function) => { mockWsHandlers[ev] = cb }),
  removeEventListener: vi.fn(),
  readyState: 1,
}

beforeEach(() => {
  mockWsHandlers = {}
  vi.stubGlobal('RTCPeerConnection', vi.fn(function (this: unknown) { return mockPc }))
  vi.stubGlobal('WebSocket', vi.fn(function (this: unknown) { return mockWs }))
})

test('renders call page with device selector', () => {
  // Mock enumerateDevices for DeviceSelector.
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      enumerateDevices: vi.fn().mockResolvedValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    configurable: true,
  })

  render(
    <CallPage
      goServerUrl="ws://localhost:8080/ws/signal"
      sessionToken="tok123"
      onHangUp={vi.fn()}
    />,
  )
  // DeviceSelector labels should be rendered.
  expect(screen.getByText(/microphone/i)).toBeInTheDocument()
  expect(screen.getByText(/camera/i)).toBeInTheDocument()
})

test('connects WebSocket to Go server on mount', async () => {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      enumerateDevices: vi.fn().mockResolvedValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    configurable: true,
  })

  render(
    <CallPage
      goServerUrl="ws://localhost:8080/ws/signal"
      sessionToken="tok123"
      onHangUp={vi.fn()}
    />,
  )
  await waitFor(() => {
    expect(vi.mocked(globalThis.WebSocket)).toHaveBeenCalledWith(
      'ws://localhost:8080/ws/signal?token=tok123',
    )
  })
})
