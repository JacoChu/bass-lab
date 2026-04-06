import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CallPage from './CallPage'

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

function stubMediaDevices() {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      enumerateDevices: vi.fn().mockResolvedValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    configurable: true,
  })
}

function setupFetch(goServerUrl = 'ws://localhost:8080/ws/signal') {
  globalThis.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    if (url.includes('/api/invitations/') && opts?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ go_server_url: goServerUrl }),
      })
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
  })
}

/** Renders CallPage at /call/:token, optionally with location state. */
function renderCallPage(token = 'tok123', state?: { goServerUrl: string }) {
  const initialEntry = state
    ? { pathname: `/call/${token}`, state }
    : `/call/${token}`
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/call/:token" element={<CallPage />} />
        <Route path="/friends" element={<div data-testid="friends-page-stub" />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockWsHandlers = {}
  vi.stubGlobal('RTCPeerConnection', vi.fn(function (this: unknown) { return mockPc }))
  vi.stubGlobal('WebSocket', vi.fn(function (this: unknown) { return mockWs }))
  stubMediaDevices()
  setupFetch()
})

// ─── Task 9.4: Call page ──────────────────────────────────────────────────────

test('renders device selector on call page', () => {
  renderCallPage()
  expect(screen.getByText(/microphone/i)).toBeInTheDocument()
  expect(screen.getByText(/camera/i)).toBeInTheDocument()
})

test('shows Connecting status initially', () => {
  renderCallPage()
  expect(screen.getByTestId('connection-status')).toHaveTextContent('Connecting…')
})

test('calls accept API when no goServerUrl in location state', async () => {
  renderCallPage('tok123')
  await waitFor(() =>
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/invitations/tok123/accept',
      expect.objectContaining({ method: 'POST' }),
    ),
  )
})

test('skips accept API when goServerUrl provided in location state', async () => {
  renderCallPage('tok123', { goServerUrl: 'ws://go:8080/ws/signal' })
  // Wait a tick to ensure no fetch is dispatched.
  await new Promise(r => setTimeout(r, 50))
  const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>
  const acceptCalls = fetchMock.mock.calls.filter(
    ([url]: [string]) => url.includes('/api/invitations/'),
  )
  expect(acceptCalls).toHaveLength(0)
})

test('connects WebSocket to go_server_url from accept API', async () => {
  renderCallPage('tok123')
  await waitFor(() =>
    expect(vi.mocked(globalThis.WebSocket)).toHaveBeenCalledWith(
      'ws://localhost:8080/ws/signal?token=tok123',
    ),
  )
})

test('connects WebSocket to go_server_url from location state', async () => {
  renderCallPage('tok456', { goServerUrl: 'ws://go:8080/ws/signal' })
  await waitFor(() =>
    expect(vi.mocked(globalThis.WebSocket)).toHaveBeenCalledWith(
      'ws://go:8080/ws/signal?token=tok456',
    ),
  )
})

// ─── Task 9.5: Hangup navigates to /friends ───────────────────────────────────

test('hangup button navigates to /friends', async () => {
  renderCallPage()
  await userEvent.click(screen.getByText('掛斷'))
  expect(screen.getByTestId('friends-page-stub')).toBeInTheDocument()
})
