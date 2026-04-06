import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function AppLayout() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  )
  const [displayName, setDisplayName] = useState<string>('')

  // Sync theme to <html data-theme> and localStorage.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Fetch display_name for the nav bar dropdown.
  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.display_name) setDisplayName(data.display_name) })
      .catch(() => {})
  }, [])

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  async function handleSignOut() {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]')
    const csrfToken = csrfMeta?.getAttribute('content') ?? ''
    await fetch('/users/sign_out', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrfToken },
    })
    navigate('/users/sign_in')
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Fixed top navbar */}
      <nav className="navbar bg-base-200 shadow-sm fixed top-0 left-0 right-0 z-50">
        {/* Left: brand logo */}
        <div className="navbar-start">
          <Link to="/lobby" className="btn btn-ghost text-xl font-bold">
            Bass-Lab
          </Link>
        </div>

        {/* Center: nav links */}
        <div className="navbar-center hidden md:flex gap-2">
          <Link to="/friends" className="btn btn-ghost btn-sm">
            好友
          </Link>
          <Link to="/orders" className="btn btn-ghost btn-sm">
            訂單
          </Link>
        </div>

        {/* Right: quick call, theme toggle, user dropdown */}
        <div className="navbar-end gap-1">
          <Link to="/lobby" className="btn btn-primary btn-sm hidden sm:flex">
            快速通話
          </Link>

          {/* Dark/light toggle */}
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            data-testid="theme-toggle"
          >
            {theme === 'light' ? (
              /* Moon icon — indicates light mode is active, click to go dark */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            ) : (
              /* Sun icon — indicates dark mode is active, click to go light */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm0 17a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm10-8a1 1 0 010 2h-1a1 1 0 010-2h1zM3 12a1 1 0 010 2H2a1 1 0 010-2h1zm15.07-6.07a1 1 0 010 1.41l-.71.71a1 1 0 01-1.41-1.41l.71-.71a1 1 0 011.41 0zM7.05 16.95a1 1 0 010 1.41l-.71.71a1 1 0 01-1.41-1.41l.71-.71a1 1 0 011.41 0zM18.36 16.95a1 1 0 011.41 0l.71.71a1 1 0 01-1.41 1.41l-.71-.71a1 1 0 010-1.41zM5.64 5.64a1 1 0 011.41 0l.71.71A1 1 0 016.35 7.76l-.71-.71a1 1 0 010-1.41zM12 7a5 5 0 110 10A5 5 0 0112 7z" />
              </svg>
            )}
          </button>

          {/* User dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-1">
              <span className="hidden sm:inline">{displayName || '帳號'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow">
              <li>
                <Link to="/profile">個人資料</Link>
              </li>
              <li>
                <Link to="/friends" className="md:hidden">好友</Link>
              </li>
              <li>
                <Link to="/orders" className="md:hidden">訂單</Link>
              </li>
              <li>
                <button onClick={handleSignOut} className="text-error">
                  登出
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Page content below fixed navbar */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
