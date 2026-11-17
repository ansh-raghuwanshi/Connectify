import { useEffect, useState } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import { verifyEmail, resendVerificationEmail } from '../services/auth.service'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const { token: paramToken } = useParams()
  const token = paramToken || searchParams.get('token')

  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendStatus, setResendStatus] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided in URL.')
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
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Account Verification</h1>

      {status === 'verifying' && <p>Verifying your account, please wait...</p>}

      {status === 'success' && (
        <div style={{ color: '#16a34a' }}>
          <h3>Verification Successful!</h3>
          <p>{message}</p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              marginTop: '15px',
              padding: '10px 24px',
              background: '#2563eb',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            Proceed to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: '#dc2626' }}>
          <h3>Verification Failed</h3>
          <p>{message}</p>

          <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 10px', color: '#1e293b' }}>Resend Verification Link</h4>
            <form onSubmit={handleResend}>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Resend Email
              </button>
            </form>
            {resendStatus && <p style={{ marginTop: '10px', fontSize: '13px', color: '#475569' }}>{resendStatus}</p>}
          </div>

          <p style={{ marginTop: '20px' }}>
            <Link to="/login" style={{ color: '#2563eb' }}>
              Back to Login
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

export default VerifyEmail
