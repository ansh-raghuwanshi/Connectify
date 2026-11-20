import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { resendVerificationEmail } from '../services/auth.service'
import { Icon } from '../components/common/Icons'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/home'

  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isUnverified, setIsUnverified] = useState(false)
  const [resendStatus, setResendStatus] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsUnverified(false)
    setResendStatus('')
    setLoading(true)

    try {
      const response = await login(formData)
      if (response?.data?.accessToken) {
        navigate(from, { replace: true })
      }
    } catch (err) {
      const msg = err.message || 'Login failed'
      setError(msg)
      if (msg.toLowerCase().includes('verified') || msg.toLowerCase().includes('verification')) {
        setIsUnverified(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!formData.email) return
    try {
      await resendVerificationEmail(formData.email)
      setResendStatus('Verification link re-sent! Please check your email inbox (and Spam/Junk folder).')
    } catch (err) {
      setResendStatus(err.message || 'Failed to resend verification email.')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background: 'var(--bg-page)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '40px 36px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          zIndex: 10,
          margin: 0,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-main)',
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <div className="navbar-brand-icon">
              <Icon name="users" size={20} color="#ffffff" />
            </div>
            <span>
              Connect<span style={{ color: 'var(--primary)' }}>ify</span>
            </span>
          </Link>
          <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
            Welcome Back
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Sign in to your college alumni & student network
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            {error}
            {isUnverified && (
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleResend}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Click here to resend verification link
                </button>
              </div>
            )}
          </div>
        )}

        {resendStatus && (
          <div
            style={{
              backgroundColor: 'var(--primary-light)',
              border: '1px solid #c7d2fe',
              color: 'var(--primary-hover)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '13px',
            }}
          >
            {resendStatus}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="e.g. rahul@college.edu"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', padding: '13px', fontSize: '15px' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Join Connectify Free
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
