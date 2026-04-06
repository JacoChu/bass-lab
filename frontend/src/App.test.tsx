import { render, screen } from '@testing-library/react'
import App from './App'

// Stub all page components and AppLayout so App routing can be tested in isolation.
vi.mock('./components/Layout/AppLayout', () => ({
  default: () => {
    const { Outlet } = require('react-router-dom')
    return <div data-testid="app-layout"><Outlet /></div>
  },
}))
vi.mock('./pages/FriendsPage', () => ({
  default: () => <div data-testid="friends-page">FriendsPage</div>,
}))
vi.mock('./pages/CallPage', () => ({
  default: () => <div data-testid="call-page">CallPage</div>,
}))
vi.mock('./pages/LobbyPage', () => ({
  default: () => <div data-testid="lobby-page">LobbyPage</div>,
}))
vi.mock('./pages/OrdersPage', () => ({
  default: () => <div data-testid="orders-page">OrdersPage</div>,
}))
vi.mock('./pages/ProfilePage', () => ({
  default: () => <div data-testid="profile-page">ProfilePage</div>,
}))

test('/ redirects to /lobby route', () => {
  render(<App />)
  expect(screen.getByTestId('lobby-page')).toBeInTheDocument()
})
