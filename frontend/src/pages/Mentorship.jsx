import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getMyMentorshipRequests,
  updateMentorshipStatus,
  requestMentorship,
} from '../services/mentorship.service'
import { getAlumni } from '../services/alumni.service'

function Mentorship() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('requests') // 'requests' | 'browse'
  const [requests, setRequests] = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Request modal state for browsing mentors
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [topic, setTopic] = useState('Career Guidance')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getMyMentorshipRequests()
      setRequests(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load mentorship requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchMentors = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAlumni()
      const available = (res?.data || []).filter((a) => a.mentorshipAvailable)
      setMentors(available)
    } catch (err) {
      setError(err.message || 'Failed to load available mentors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests()
    } else {
      fetchMentors()
    }
  }, [activeTab])

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const res = await updateMentorshipStatus(requestId, newStatus)
      if (res?.data) {
        setRequests(requests.map((r) => (r._id === requestId ? res.data : r)))
      }
    } catch (err) {
      alert(err.message || 'Failed to update request status')
    }
  }

  const handleSendRequest = async (e) => {
    e.preventDefault()
    if (!selectedMentor || !message.trim()) return

    setSubmitting(true)
    setSuccessMsg('')
    try {
      await requestMentorship(selectedMentor.id, topic, message.trim())
      setSuccessMsg('Mentorship request sent successfully!')
      setTimeout(() => {
        setSelectedMentor(null)
        setMessage('')
        setSuccessMsg('')
        setActiveTab('requests')
      }, 1400)
    } catch (err) {
      alert(err.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '26px' }}>Mentorship Hub</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
          Connect with experienced graduates for career guidance, mock interviews, and resume reviews.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('requests')}
          className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
        >
          {user?.role === 'alumni' ? 'Incoming Requests' : 'My Mentorship Requests'} ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`btn btn-sm ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Find Available Mentors
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* TAB 1: Requests View */}
      {activeTab === 'requests' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤝</div>
              <h3>No mentorship requests</h3>
              <p>
                {user?.role === 'alumni'
                  ? 'No students have requested mentorship from you yet. Ensure "Available for Mentorship" is turned on in your profile!'
                  : "You haven't requested mentorship yet. Switch to 'Find Available Mentors' to get started!"}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {requests.map((req) => {
                const isAlumni = user?.role === 'alumni'
                const partner = isAlumni ? req.student : req.alumni

                return (
                  <div key={req._id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="avatar avatar-md">
                          {partner?.name ? partner.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '16px' }}>
                            {isAlumni ? `Student: ${partner?.name}` : `Mentor: ${partner?.name}`}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {partner?.currentCompany ? `${partner.jobTitle || 'Role'} at ${partner.currentCompany}` : `${partner?.branch || 'Student'}`}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`badge ${
                            req.status === 'accepted'
                              ? 'badge-green'
                              : req.status === 'rejected'
                              ? 'badge-gray'
                              : 'badge-yellow'
                          }`}
                        >
                          Status: {req.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-page)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
                        Topic: {req.topic}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        "{req.message}"
                      </div>
                    </div>

                    {/* Alumni Accept / Reject Buttons */}
                    {isAlumni && req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'rejected')}
                          className="btn btn-secondary btn-sm"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'accepted')}
                          className="btn btn-primary btn-sm"
                        >
                          ✓ Accept Mentorship
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Browse Mentors View */}
      {activeTab === 'browse' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Finding available mentors...
            </div>
          ) : mentors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <h3>No mentors listed right now</h3>
              <p>Check back soon as more graduates opt-in for mentorship!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {mentors.map((mentor) => (
                <div key={mentor.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="avatar avatar-md">
                      {mentor.user?.name ? mentor.user.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{mentor.user?.name}</h4>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {mentor.jobTitle || 'Alumni'} {mentor.currentCompany ? `@ ${mentor.currentCompany}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', flex: 1 }}>
                    <div><strong>Branch:</strong> {mentor.branch || mentor.degree}</div>
                    <div><strong>Class of:</strong> {mentor.passingYear || 'N/A'}</div>
                  </div>

                  {mentor.skills && mentor.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {mentor.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="badge badge-blue">{s}</span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    🤝 Request Mentorship
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Request Mentorship Modal */}
      {selectedMentor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ margin: '0 0 8px' }}>Request Mentorship</h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Send a guidance request to <strong>{selectedMentor.user?.name}</strong> (
              {selectedMentor.jobTitle || 'Alumni'} @ {selectedMentor.currentCompany || 'N/A'})
            </p>

            {successMsg ? (
              <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleSendRequest}>
                <div className="form-group">
                  <label className="form-label">Topic</label>
                  <select
                    className="select"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option value="Career Guidance">Career Guidance</option>
                    <option value="Resume Review">Resume & Portfolio Review</option>
                    <option value="Technical Interview Prep">Technical Interview Prep</option>
                    <option value="Industry Transition">Industry Transition</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Note to Mentor</label>
                  <textarea
                    className="textarea"
                    rows="4"
                    required
                    placeholder="Briefly describe your goals and what you would like advice on..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="btn btn-primary"
                  >
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Mentorship
