import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import FriendsPage from './pages/FriendsPage'
import CallPage from './pages/CallPage'
import LobbyPage from './pages/LobbyPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authenticated pages wrapped in AppLayout (persistent nav bar) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/lobby" replace />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Full-screen call page — no nav bar */}
        <Route path="/call/:token" element={<CallPage />} />
      </Routes>
    </BrowserRouter>
  )
}
