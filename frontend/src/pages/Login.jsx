import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { resendVerificationEmail } from '../services/auth.service'

function Login() {
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
  const [directVerifyUrl, setDirectVerifyUrl] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsUnverified(false)
    setResendStatus('')
    setDirectVerifyUrl('')
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
      const res = await resendVerificationEmail(formData.email)
      setResendStatus('Verification link re-sent! Please check your email inbox (and Spam/Junk folder).')
      if (res?.data?.verificationUrl) {
        setDirectVerifyUrl(res.data.verificationUrl)
      }
    } catch (err) {
      setResendStatus(err.message || 'Failed to resend verification email.')
    }
  }

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto', padding: '32px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '6px', fontSize: '24px' }}>Sign in to Connectify</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 0, marginBottom: '24px', fontSize: '14px' }}>
        Welcome back to your college networking community
      </p>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '14px' }}>
          {error}
          {isUnverified && (
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleResend}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: 600 }}
              >
                Click here to resend verification link
              </button>
            </div>
          )}
        </div>
      )}

      {resendStatus && (
        <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px' }}>
          {resendStatus}
        </div>
      )}

      {directVerifyUrl && (
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '6px' }}>
            ⚡ Instant Verification Link:
          </div>
          <a href={directVerifyUrl} className="btn btn-primary btn-sm" style={{ display: 'inline-block', width: '100%' }}>
            Click Here to Verify Account Now
          </a>
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
            placeholder="e.g. yourname@college.edu"
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
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '15px' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login
