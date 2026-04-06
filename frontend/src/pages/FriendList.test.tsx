import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FriendList from './FriendList'

// Mock @rails/actioncable
vi.mock('@rails/actioncable', () => ({
  createConsumer: vi.fn(() => ({
    subscriptions: {
      create: vi.fn((channel: string, handlers: Record<string, Function>) => {
        // Expose handlers per channel name so tests can trigger them.
        const key = `__${channel}Handlers`
        ;(globalThis as Record<string, unknown>)[key] = handlers
        return { unsubscribe: vi.fn() }
      }),
    },
  })),
}))

// Mock fetch for GET /api/friends and POST /api/invitations.
function setupFetch(friends = [
  { user_id: 1, display_name: 'Alice', avatar_url: null },
  { user_id: 2, display_name: 'Bob', avatar_url: null },
]) {
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

beforeEach(() => {
  setupFetch()
  delete (globalThis as Record<string, unknown>).__presenceHandlers
})

test('renders friends list after fetch', async () => {
  render(<FriendList currentUserId={99} />)
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })
})

test('updates friend status to online when presence broadcast received', async () => {
  render(<FriendList currentUserId={99} />)
  await waitFor(() => screen.getByText('Alice'))

  act(() => {
    const handlers = (globalThis as Record<string, unknown>).__PresenceChannelHandlers as Record<string, Function>
    handlers.received?.({ user_id: 1, status: 'online' })
  })

  expect(screen.getByTestId('status-1')).toHaveAttribute('data-status', 'online')
})

test('call button appears for online friend', async () => {
  render(<FriendList currentUserId={99} />)
  await waitFor(() => screen.getByText('Alice'))

  act(() => {
    const handlers = (globalThis as Record<string, unknown>).__PresenceChannelHandlers as Record<string, Function>
    handlers.received?.({ user_id: 1, status: 'online' })
  })

  expect(screen.getByTestId('call-btn-1')).toBeInTheDocument()
})

test('POST /api/invitations on call button click', async () => {
  render(<FriendList currentUserId={99} />)
  await waitFor(() => screen.getByText('Alice'))

  act(() => {
    const handlers = (globalThis as Record<string, unknown>).__PresenceChannelHandlers as Record<string, Function>
    handlers.received?.({ user_id: 1, status: 'online' })
  })

  await userEvent.click(screen.getByTestId('call-btn-1'))
  expect(globalThis.fetch).toHaveBeenCalledWith('/api/invitations', expect.objectContaining({ method: 'POST' }))
})
