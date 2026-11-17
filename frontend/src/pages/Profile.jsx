import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    department: '',
    branch: '',
    degree: '',
    passoutYear: '',
    currentCompany: '',
    jobTitle: '',
    skills: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    mentorshipAvailable: false,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        department: user.department || '',
        branch: user.branch || '',
        degree: user.degree || '',
        passoutYear: user.passoutYear || '',
        currentCompany: user.currentCompany || '',
        jobTitle: user.jobTitle || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
        location: user.location || '',
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || '',
        mentorshipAvailable: Boolean(user.mentorshipAvailable),
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage('')

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      await updateUser({
        ...formData,
        skills: skillsArray,
      })

      setStatusMessage('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      alert(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="avatar avatar-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '24px' }}>{user?.name}</h2>
                <span className={`badge badge-${user?.role === 'alumni' ? 'blue' : 'gray'}`}>
                  {user?.role}
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                {user?.email} • {user?.branch || user?.department || 'University Member'}
              </div>
              {user?.currentCompany && (
                <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>
                  {user.jobTitle || 'Role'} at {user.currentCompany}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-outline'}`}
          >
            {isEditing ? 'Cancel Editing' : '✏️ Edit Profile'}
          </button>
        </div>

        {statusMessage && (
          <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginTop: '16px', fontSize: '14px' }}>
            {statusMessage}
          </div>
        )}
      </div>

      {/* Profile Details or Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSave} className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px' }}>Edit Professional Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Branch / Specialization</label>
              <input
                type="text"
                className="input"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input
                type="text"
                className="input"
                name="passoutYear"
                value={formData.passoutYear}
                onChange={handleChange}
                placeholder="e.g. 2024"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Degree</label>
              <input
                type="text"
                className="input"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. B.Tech, M.Tech"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Company / Organization</label>
              <input
                type="text"
                className="input"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleChange}
                placeholder="e.g. Google, Microsoft, Student"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Job Role</label>
              <input
                type="text"
                className="input"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="input"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bengaluru, Remote"
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                className="input"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills (comma separated)</label>
            <input
              type="text"
              className="input"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Python, System Design"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Professional Bio / About Me</label>
            <textarea
              className="textarea"
              rows="3"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Share a short summary of your background, experience, or academic interests..."
            />
          </div>

          {user?.role === 'alumni' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', padding: '14px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
              <input
                type="checkbox"
                id="mentorshipAvailable"
                name="mentorshipAvailable"
                checked={formData.mentorshipAvailable}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="mentorshipAvailable" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-dark)', cursor: 'pointer' }}>
                Available for Student Mentorship (Enables students to send mentorship requests)
              </label>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Bio Section */}
          <div className="card">
            <h4 className="card-title">About Me</h4>
            <p style={{ color: user?.bio ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {user?.bio || 'No bio added yet. Click "Edit Profile" to share your journey and interests.'}
            </p>
          </div>

          {/* Academic & Professional Information */}
          <div className="card">
            <h4 className="card-title">Academic & Professional Background</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Branch / Department</div>
                <div style={{ fontWeight: 600 }}>{user?.branch || user?.department || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Graduation Year</div>
                <div style={{ fontWeight: 600 }}>{user?.passoutYear || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Degree</div>
                <div style={{ fontWeight: 600 }}>{user?.degree || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Location</div>
                <div style={{ fontWeight: 600 }}>{user?.location || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="card">
            <h4 className="card-title">Skills & Technologies</h4>
            {user?.skills && user.skills.length > 0 ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {user.skills.map((s, idx) => (
                  <span key={idx} className="badge badge-blue" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
                No skills listed yet. Add your programming languages, tools, or domain knowledge!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
