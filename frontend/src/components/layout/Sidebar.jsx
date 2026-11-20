import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../common/Icons'

export function Sidebar() {
  const location = useLocation()
  const path = location.pathname

  const links = [
    { to: '/home', label: 'Feed & Updates', icon: 'newspaper' },
    { to: '/alumni', label: 'Alumni Directory', icon: 'graduation-cap' },
    { to: '/mentorship', label: 'Mentorship Hub', icon: 'handshake' },
    { to: '/events', label: 'Campus Events', icon: 'calendar' },
    { to: '/messages', label: 'Direct Messages', icon: 'message-square' },
    { to: '/ai-assistant', label: 'Connectify AI', icon: 'sparkles', highlight: true },
    { to: '/profile', label: 'My Profile', icon: 'user' },
  ]

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-section-title">Navigation</div>
        <nav className="sidebar-nav">
          {links.map((link) => {
            const isActive = path === link.to || (link.to !== '/home' && path.startsWith(link.to))
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={
                  link.highlight && !isActive
                    ? {
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        fontWeight: 600,
                      }
                    : {}
                }
              >
                <span className="nav-icon">
                  <Icon
                    name={link.icon}
                    size={18}
                    color={isActive ? 'var(--primary)' : link.highlight ? 'var(--primary)' : 'currentColor'}
                  />
                </span>
                <span>{link.label}</span>
                {link.highlight && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    AI
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div
        className="sidebar-bottom-card"
        style={{
          marginTop: 'auto',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--badge-blue-bg)',
          border: '1px solid var(--badge-blue-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '18px' }}>✨</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--badge-blue-text)' }}>
            Smart Career Matching
          </span>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Search for alumni by tech stack or target company with Connectify AI.
        </p>
        <Link
          to="/ai-assistant"
          className="btn btn-primary btn-sm"
          style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
        >
          Try AI Search →
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar
