import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()
  const path = location.pathname

  const links = [
    { to: '/home', label: 'Feed & Updates', icon: '📰' },
    { to: '/alumni', label: 'Alumni Directory', icon: '🎓' },
    { to: '/mentorship', label: 'Mentorship Hub', icon: '🤝' },
    { to: '/events', label: 'Campus Events', icon: '📅' },
    { to: '/messages', label: 'Direct Messages', icon: '💬' },
    { to: '/ai-assistant', label: 'Connectify AI', icon: '✨' },
    { to: '/profile', label: 'My Profile', icon: '👤' },
  ]

  return (
    <aside className="sidebar">
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map((link) => {
          const isActive = path === link.to || (link.to !== '/home' && path.startsWith(link.to))
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '16px' }}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
