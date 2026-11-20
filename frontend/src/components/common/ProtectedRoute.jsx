import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from './Icons'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-glow)',
            animation: 'pulseGlow 2s infinite ease-in-out',
          }}
        >
          <Icon name="users" size={24} color="#ffffff" />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
          Connecting to campus network...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
