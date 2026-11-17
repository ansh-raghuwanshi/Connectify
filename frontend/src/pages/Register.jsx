import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    enrollmentNumber: '',
    passoutYear: '',
    department: '',
    branch: '',
    degree: 'B.Tech',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessInfo(null)
    setLoading(true)

    try {
      const response = await register(formData)
      setSuccessInfo(response)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '32px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '6px', fontSize: '24px' }}>Join Connectify</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 0, marginBottom: '24px', fontSize: '14px' }}>
        Official university networking for students, alumni, and faculty
      </p>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {successInfo ? (
        <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Registration Initiated!</h4>
          <p style={{ fontSize: '14px', lineHeight: 1.5, margin: '0 0 14px' }}>{successInfo.message}</p>
          
          <div style={{ fontSize: '12px', color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', textAlign: 'left', lineHeight: 1.4 }}>
            💡 <strong>Email Inbox Tip:</strong> The email has been sent via Brevo. If it doesn't appear in your Primary Inbox within 1–2 minutes, please check your <strong>Spam / Junk</strong> or <strong>Promotions</strong> folder.
          </div>

          {successInfo.data?.verificationUrl && (
            <div style={{ margin: '16px 0', padding: '14px', background: '#eff6ff', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '8px' }}>
                ⚡ Instant Verification (Local Dev Mode):
              </div>
              <a
                href={successInfo.data.verificationUrl}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', display: 'inline-block', padding: '10px' }}
              >
                Click Here to Verify Account Instantly
              </a>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <Link
              to="/login"
              className="btn btn-outline"
              style={{ padding: '8px 24px' }}
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="form-group">
            <label className="form-label">College / Official Email Address</label>
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

          <div className="form-group">
            <label className="form-label">Password (min 6 characters)</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Your Role</label>
            <select
              name="role"
              className="select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="teacher">Faculty / Teacher</option>
            </select>
          </div>

          {(formData.role === 'student' || formData.role === 'alumni') && (
            <>
              <div className="form-group">
                <label className="form-label">Enrollment / Roll Number</label>
                <input
                  type="text"
                  name="enrollmentNumber"
                  className="input"
                  value={formData.enrollmentNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 0801CS201045"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    {formData.role === 'student' ? 'Expected Passout' : 'Graduation Year'}
                  </label>
                  <input
                    type="number"
                    name="passoutYear"
                    className="input"
                    value={formData.passoutYear}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 2024"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    className="input"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Branch / Department</label>
                <input
                  type="text"
                  name="branch"
                  className="input"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </>
          )}

          {formData.role === 'teacher' && (
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="input"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Department of Computer Science"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '10px' }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}

export default Register
