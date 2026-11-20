import { useEffect, useState } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import { verifyEmail, resendVerificationEmail } from '../services/auth.service'
import { Icon } from '../components/common/Icons'

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const { token: paramToken } = useParams()
  const token = paramToken || searchParams.get('token')

  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendStatus, setResendStatus] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided in the URL.')
      return
    }

    verifyEmail(token)
      .then((res) => {
        setStatus('success')
        setMessage(res.message || 'Your email has been verified successfully!')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Verification token is invalid or has expired.')
      })
  }, [token])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!resendEmail) return
    try {
      await resendVerificationEmail(resendEmail)
      setResendStatus('If an account exists, a new verification link has been sent.')
    } catch (err) {
      setResendStatus(err.message || 'Failed to send verification email.')
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
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '40px 32px',
          textAlign: 'center',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-xl)',
          margin: 0,
        }}
      >
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
            marginBottom: '24px',
          }}
        >
          <div className="navbar-brand-icon">
            <Icon name="users" size={20} color="#ffffff" />
          </div>
          <span>
            Connect<span style={{ color: 'var(--primary)' }}>ify</span>
          </span>
        </Link>

        {status === 'verifying' && (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>Verifying Account</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              Verifying your email token with the university database...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="check" size={32} color="var(--success)" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '22px', color: 'var(--success)', fontWeight: 800 }}>
              Verification Successful!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              {message}
            </p>
            <Link
              to="/login"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', padding: '12px' }}
            >
              Proceed to Sign In →
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Icon name="x" size={32} color="var(--danger)" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '22px', color: 'var(--danger)', fontWeight: 800 }}>
              Verification Failed
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              {message}
            </p>

            <div
              style={{
                padding: '20px',
                background: 'var(--slate-50)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
              }}
            >
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700 }}>
                Request New Verification Link
              </h4>
              <form onSubmit={handleResend}>
                <input
                  type="email"
                  placeholder="Enter your registered college email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  className="input"
                  style={{ marginBottom: '10px' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  Resend Verification Email
                </button>
              </form>
              {resendStatus && (
                <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', margin: '10px 0 0' }}>
                  {resendStatus}
                </p>
              )}
            </div>

            <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Return to Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
