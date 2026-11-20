import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { summarizeProfile } from '../services/ai.service'
import { Icon } from '../components/common/Icons'
import { Badge } from '../components/common/Badge'

function Profile() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const [aiDossier, setAiDossier] = useState(null)
  const [analyzingProfile, setAnalyzingProfile] = useState(false)
  const [bioAppliedToast, setBioAppliedToast] = useState(false)

  const handleGenerateAiReview = async () => {
    setAnalyzingProfile(true)
    try {
      const res = await summarizeProfile(user?._id)
      if (res?.data) {
        setAiDossier(res.data)
      }
    } catch (err) {
      alert(err.message || 'Could not analyze profile')
    } finally {
      setAnalyzingProfile(false)
    }
  }

  const handleApplyAiSummaryToBio = async () => {
    if (!aiDossier?.summary) return
    try {
      await updateUser({ bio: aiDossier.summary })
      setFormData((prev) => ({ ...prev, bio: aiDossier.summary }))
      setBioAppliedToast(true)
      setTimeout(() => setBioAppliedToast(false), 3000)
    } catch (err) {
      alert(err.message || 'Failed to update bio')
    }
  }

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
          <div className="card">
            <h4 className="card-title">About Me</h4>
            <p style={{ color: user?.bio ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {user?.bio || 'No bio added yet. Click "Edit Profile" to share your journey and interests.'}
            </p>
          </div>

          <div
            className="card"
            style={{
              padding: '24px',
              border: '1px solid var(--primary-border)',
              background: 'linear-gradient(180deg, var(--primary-light) 0%, var(--bg-card) 60%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="sparkles" size={16} color="#ffffff" />
                </div>
                <div>
                  <h4 className="card-title" style={{ margin: 0, fontSize: '17px' }}>
                    Connectify AI Profile Intelligence
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Executive profile synthesis, technical clustering, and networking optimization
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiReview}
                disabled={analyzingProfile}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <Icon name="sparkles" size={14} color="#ffffff" />
                <span>{analyzingProfile ? 'Synthesizing...' : '⚡ Generate AI Profile Review'}</span>
              </button>
            </div>

            {bioAppliedToast && (
              <div
                style={{
                  background: 'var(--success-light)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Icon name="check" size={15} color="var(--success)" />
                <span>AI Executive Summary successfully applied to your profile bio!</span>
              </div>
            )}

            {aiDossier ? (
              <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Executive Headline
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {aiDossier.headline}
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Executive Summary Narrative
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                    {aiDossier.executiveSummary || aiDossier.summary}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '14px',
                    marginBottom: '18px',
                  }}
                >
                  {aiDossier.strengths?.length > 0 && (
                    <div style={{ background: 'var(--success-light)', border: '1px solid var(--success-border)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--success)', marginBottom: '6px' }}>
                        🌟 Profile Highlights & Strengths
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        {aiDossier.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiDossier.suggestions?.length > 0 && (
                    <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning-border)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--warning)', marginBottom: '6px' }}>
                        💡 Recommendations to Attract More Connections
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        {aiDossier.suggestions.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleApplyAiSummaryToBio}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px' }}
                    title="Copy this executive narrative into your profile About Me bio"
                  >
                    <Icon name="check" size={14} />
                    <span>Apply Executive Summary to My Bio</span>
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Click <strong>"Generate AI Profile Review"</strong> to generate a comprehensive executive summary of your background, analyze your skill competency clusters, and receive actionable tips to optimize your profile for mentorship and career opportunities.
              </p>
            )}
          </div>

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
