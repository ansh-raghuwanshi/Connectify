import { Link } from 'react-router-dom'
import { Icon } from '../components/common/Icons'

export function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background: 'var(--bg-page)',
        color: 'var(--text-main)',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div
          style={{
            fontSize: '110px',
            fontWeight: 800,
            lineHeight: 1,
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            fontFamily: 'var(--font-heading)',
          }}
        >
          404
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-main)' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
          The page or university resource you are looking for doesn't exist or has moved to a new route.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
            <Icon name="users" size={18} />
            <span>Go to Home</span>
          </Link>
          <Link
            to="/alumni"
            className="btn btn-secondary btn-lg"
          >
            Alumni Directory
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
