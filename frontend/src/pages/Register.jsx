import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/common/Icons'

export function Register() {
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'var(--bg-page)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '15%',
          left: '35%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="card"
        style={{
          maxWidth: '520px',
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
            Join Your College Network
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Official university network for students, alumni, and faculty
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
          </div>
        )}

        {successInfo ? (
          <div
            style={{
              backgroundColor: 'var(--success-light)',
              border: '1px solid var(--success-border)',
              color: 'var(--success)',
              padding: '28px 24px',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>✉️</div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>
              Registration Initiated!
            </h4>
            <p style={{ fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px', color: 'var(--text-muted)' }}>
              {successInfo.message}
            </p>

            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-main)',
                background: 'var(--success-light)',
                border: '1px solid var(--success-border)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '18px',
                textAlign: 'left',
                lineHeight: 1.5,
              }}
            >
              💡 <strong>Email Inbox Tip:</strong> If the verification email does not appear in your Primary Inbox within 1–2 minutes, please check your <strong>Spam / Junk</strong> folder.
            </div>

            <div style={{ marginTop: '20px' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '10px 28px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
              className="btn btn-primary btn-lg"
              style={{ width: '100%', padding: '13px', fontSize: '15px', marginTop: '12px' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Register
