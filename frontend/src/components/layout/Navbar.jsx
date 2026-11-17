import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to={isAuthenticated ? "/home" : "/"} className="navbar-brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Connectify
      </Link>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <Link to="/ai-assistant" className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
              <span style={{ color: '#2563eb', fontWeight: 'bold' }}>✨</span> AI Assistant
            </Link>

            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div className="avatar avatar-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name}</span>
                <span className={`badge badge-${user?.role === 'alumni' ? 'blue' : user?.role === 'teacher' ? 'yellow' : 'green'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                  {user?.role}
                </span>
              </div>
            </Link>

            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Join Connectify
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
