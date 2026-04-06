import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// Stub heavy page dependencies so App routing can be tested in isolation.
vi.mock('./pages/FriendsPage', () => ({
  default: () => <div data-testid="friends-page">FriendsPage</div>,
}))
vi.mock('./pages/CallPage', () => ({
  default: () => <div data-testid="call-page">CallPage</div>,
}))

// App uses BrowserRouter internally; we override history via window.location for test purposes.
// Simpler: render App wrapping nothing and check the path redirects to /friends.

test('/ redirects to /friends route', () => {
  // Use MemoryRouter externally to control initial path.
  // App exports inner routes for testability — or we just check the DOM.
  // Since App contains BrowserRouter itself, render it and verify the friend page stub shows.
  render(<App />)
  expect(screen.getByTestId('friends-page')).toBeInTheDocument()
})
