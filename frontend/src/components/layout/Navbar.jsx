import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Icon } from '../common/Icons'
import { Avatar } from '../common/Avatar'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to={isAuthenticated ? '/home' : '/'} className="navbar-brand">
        <div className="navbar-brand-icon">
          <Icon name="users" size={20} color="#ffffff" />
        </div>
        <span>
          Connect<span className="highlight">ify</span>
        </span>
      </Link>

      {!isAuthenticated && (
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
          className="desktop-nav"
        >
          <a
            href="#features"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}
          >
            Pillars
          </a>
          <a
            href="#network"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}
          >
            Alumni Constellation
          </a>
          <a
            href="#mentorship"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}
          >
            Mentorship
          </a>
          <a
            href="#ai"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}
          >
            AI Engine
          </a>
        </nav>
      )}

      <div className="navbar-actions">
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-full)',
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'var(--slate-100)',
            border: '1px solid var(--border)',
          }}
          aria-label="Toggle dark mode"
        >
          <Icon
            name={isDark ? 'sun' : 'moon'}
            size={16}
            color={isDark ? '#fbbf24' : 'var(--primary)'}
          />
        </button>

        {isAuthenticated ? (
          <>
            <Link
              to="/ai-assistant"
              className="btn btn-outline btn-sm"
              style={{
                border: '1px solid var(--badge-blue-border)',
                background: 'var(--badge-blue-bg)',
                color: 'var(--badge-blue-text)',
                gap: '6px',
                fontWeight: 700,
              }}
            >
              <Icon name="sparkles" size={15} color="var(--badge-blue-text)" />
              <span className="hidden-mobile">AI Assistant</span>
            </Link>

            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                color: 'inherit',
                padding: '4px 12px 4px 4px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                transition: 'all 0.15s ease',
              }}
            >
              <Avatar name={user?.name || 'User'} src={user?.profilePicture} size="sm" />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.name}
                </span>
                <span style={{ fontSize: '10px', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                  {user?.role}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Sign Out"
              style={{ padding: '8px' }}
            >
              <Icon name="log-out" size={17} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-gradient btn-sm">
              Join Connectify →
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
