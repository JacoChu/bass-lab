import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import FriendsPage from './FriendsPage'

vi.mock('@rails/actioncable', () => ({
  createConsumer: vi.fn(() => ({
    subscriptions: {
      create: vi.fn((channel: string, handlers: Record<string, Function>) => {
        const key = `__${channel}Handlers`
        ;(globalThis as Record<string, unknown>)[key] = handlers
        return { unsubscribe: vi.fn() }
      }),
    },
  })),
}))

const DEFAULT_FRIENDS = [
  { user_id: 1, display_name: 'Alice', avatar_url: null },
  { user_id: 2, display_name: 'Bob', avatar_url: null },
]

function setupFetch(friends = DEFAULT_FRIENDS) {
  globalThis.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    if (url === '/api/friends' && !opts?.method) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(friends) })
    }
    if (url === '/api/invitations' && opts?.method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ session_token: 'tok123' }) })
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
  })
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/friends']}>
      <Routes>
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/call/:token" element={<div data-testid="call-page-stub" />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  setupFetch()
  delete (globalThis as Record<string, unknown>).__PresenceChannelHandlers
  delete (globalThis as Record<string, unknown>).__InvitationChannelHandlers
})

// ─── Task 9.1: Friend list page ──────────────────────────────────────────────

test('renders Friends page title', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByText('Friends')).toBeInTheDocument())
})

test('displays all friends after fetch', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })
})

test('friend status badge defaults to offline', async () => {
  renderPage()
  await waitFor(() => screen.getByText('Alice'))
  expect(screen.getByTestId('status-1')).toHaveAttribute('data-status', 'offline')
})

test('presence broadcast updates friend to online', async () => {
  renderPage()
  await waitFor(() => screen.getByText('Alice'))
  act(() => {
    const h = (globalThis as Record<string, unknown>).__PresenceChannelHandlers as Record<string, Function>
    h.received?.({ user_id: 1, status: 'online' })
  })
  expect(screen.getByTestId('status-1')).toHaveAttribute('data-status', 'online')
})

// ─── Task 9.2: Incoming invitation ───────────────────────────────────────────

test('incoming invitation shows modal', async () => {
  renderPage()
  await waitFor(() => screen.getByText('Alice'))
  act(() => {
    const h = (globalThis as Record<string, unknown>).__InvitationChannelHandlers as Record<string, Function>
    h.received?.({ from_user_id: 1, from_display_name: 'Alice', session_token: 'tok-abc' })
  })
  expect(screen.getByText('Alice 想要視訊通話')).toBeInTheDocument()
})

test('accepting invitation navigates to /call/:token', async () => {
  renderPage()
  await waitFor(() => screen.getByText('Alice'))
  act(() => {
    const h = (globalThis as Record<string, unknown>).__InvitationChannelHandlers as Record<string, Function>
    h.received?.({ from_user_id: 1, from_display_name: 'Alice', session_token: 'tok-abc' })
  })
  await userEvent.click(screen.getByText('接受'))
  expect(screen.getByTestId('call-page-stub')).toBeInTheDocument()
})

test('rejecting invitation closes modal', async () => {
  renderPage()
  await waitFor(() => screen.getByText('Alice'))
  act(() => {
    const h = (globalThis as Record<string, unknown>).__InvitationChannelHandlers as Record<string, Function>
    h.received?.({ from_user_id: 1, from_display_name: 'Alice', session_token: 'tok-abc' })
  })
  await userEvent.click(screen.getByText('拒絕'))
  expect(screen.queryByText('Alice 想要視訊通話')).not.toBeInTheDocument()
})

// ─── Task 9.3: Initiate call ──────────────────────────────────────────────────

test('call button visible for online friend', async () => {
  renderPage()
  await waitFor(() => screen.getByText('Alice'))
  act(() => {
    const h = (globalThis as Record<string, unknown>).__PresenceChannelHandlers as Record<string, Function>
    h.received?.({ user_id: 1, status: 'online' })
  })
  expect(screen.getByTestId('call-btn-1')).toBeInTheDocument()
})

test('clicking call button POSTs invitation and shows waiting state', async () => {
  renderPage()
  await waitFor(() => screen.getByText('Alice'))
  act(() => {
    const h = (globalThis as Record<string, unknown>).__PresenceChannelHandlers as Record<string, Function>
    h.received?.({ user_id: 1, status: 'online' })
  })
  await userEvent.click(screen.getByTestId('call-btn-1'))
  expect(globalThis.fetch).toHaveBeenCalledWith('/api/invitations', expect.objectContaining({ method: 'POST' }))
  expect(screen.getByText(/等待對方接受/)).toBeInTheDocument()
})

test('InvitationChannel acceptance message navigates to /call/:token', async () => {
  renderPage()
  await waitFor(() => screen.getByText('Alice'))
  act(() => {
    const h = (globalThis as Record<string, unknown>).__PresenceChannelHandlers as Record<string, Function>
    h.received?.({ user_id: 1, status: 'online' })
  })
  await userEvent.click(screen.getByTestId('call-btn-1'))
  act(() => {
    const h = (globalThis as Record<string, unknown>).__InvitationChannelHandlers as Record<string, Function>
    h.received?.({ accepted: true, session_token: 'tok123' })
  })
  expect(screen.getByTestId('call-page-stub')).toBeInTheDocument()
})
