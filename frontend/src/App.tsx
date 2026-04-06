import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import FriendsPage from './pages/FriendsPage'
import CallPage from './pages/CallPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/friends" replace />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/call/:token" element={<CallPage />} />
      </Routes>
    </BrowserRouter>
  )
}
