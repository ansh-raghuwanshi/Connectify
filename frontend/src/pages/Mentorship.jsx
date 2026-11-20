import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getMyMentorshipRequests,
  updateMentorshipStatus,
  requestMentorship,
} from '../services/mentorship.service'
import { getAlumni } from '../services/alumni.service'
import { Icon } from '../components/common/Icons'
import { Avatar } from '../components/common/Avatar'
import { Badge } from '../components/common/Badge'
import { Card3D } from '../components/common/Card3D'
import { Modal } from '../components/common/Modal'
import { EmptyState } from '../components/common/EmptyState'

export function Mentorship() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('requests')
  const [requests, setRequests] = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      setSuccessMsg('Mentorship request submitted successfully!')
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
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Mentorship Hub</h2>
          <Badge variant="blue" size="sm">
            1-on-1 Guidance
          </Badge>
        </div>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          Connect with experienced graduates for resume reviews, mock interviews, and career navigation
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '28px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '14px',
        }}
      >
        <button
          onClick={() => setActiveTab('requests')}
          className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '9999px', padding: '8px 18px', gap: '8px' }}
        >
          <Icon name="handshake" size={15} />
          <span>
            {user?.role === 'alumni' ? 'Incoming Mentorship Requests' : 'My Mentorship Requests'}
          </span>
          <span
            style={{
              background: activeTab === 'requests' ? 'rgba(255, 255, 255, 0.25)' : 'var(--slate-200)',
              color: activeTab === 'requests' ? '#ffffff' : 'var(--text-main)',
              padding: '2px 7px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('browse')}
          className={`btn btn-sm ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '9999px', padding: '8px 18px', gap: '8px' }}
        >
          <Icon name="users" size={15} />
          <span>Browse Available Mentors</span>
        </button>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Loading mentorship records...
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              title={user?.role === 'alumni' ? 'No Incoming Mentorship Requests' : 'No Mentorship Requests Yet'}
              message={
                user?.role === 'alumni'
                  ? 'No students have requested mentorship from you yet. Ensure "Available for Mentorship" is toggled on in your profile!'
                  : "You haven't requested mentorship from an alumnus yet. Switch to 'Browse Available Mentors' to find experienced graduates."
              }
              onReset={() => setActiveTab('browse')}
              suggestions={['Resume Review', 'Career Guidance', 'Mock Interview', 'System Design']}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {requests.map((req) => {
                const isAlumni = user?.role === 'alumni'
                const partner = isAlumni ? req.student : req.alumni
                const status = req.status || 'pending'

                return (
                  <div
                    key={req._id}
                    className="card"
                    style={{
                      padding: '24px',
                      borderLeft: `4px solid ${
                        status === 'accepted'
                          ? 'var(--success)'
                          : status === 'rejected'
                          ? 'var(--danger)'
                          : 'var(--warning)'
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <Avatar name={partner?.name || 'User'} src={partner?.profilePicture} size="md" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)' }}>
                            {isAlumni ? `Student: ${partner?.name}` : `Mentor: ${partner?.name}`}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {partner?.currentCompany ? (
                              <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                {partner.jobTitle || 'Role'} at {partner.currentCompany}
                              </span>
                            ) : (
                              <span>{partner?.branch || 'University Member'}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={
                          status === 'accepted' ? 'green' : status === 'rejected' ? 'red' : 'yellow'
                        }
                        size="md"
                      >
                        {status === 'accepted' && '✓ '}
                        {status.toUpperCase()}
                      </Badge>
                    </div>

                    <div
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '18px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Icon name="tag" size={14} />
                        <span>Topic: {req.topic}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--slate-700)', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{req.message}"
                      </div>
                    </div>

                    {isAlumni && status === 'pending' && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                          justifyContent: 'flex-end',
                          borderTop: '1px solid var(--border)',
                          paddingTop: '16px',
                        }}
                      >
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'rejected')}
                          className="btn btn-secondary btn-sm"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'accepted')}
                          className="btn btn-primary btn-sm"
                          style={{ background: 'var(--success)', borderColor: 'var(--success)', gap: '6px' }}
                        >
                          <Icon name="check" size={14} />
                          <span>Accept Request</span>
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

      {activeTab === 'browse' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Finding available mentors in the alumni directory...
            </div>
          ) : mentors.length === 0 ? (
            <EmptyState
              title="No Available Mentors Found"
              message="No alumni have currently opted in for new student mentorship requests. Check back soon as more graduates join!"
              suggestions={['Explore Directory', 'Campus Events', 'Connectify AI']}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {mentors.map((mentor) => (
                <Card3D
                  key={mentor.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                    <Avatar name={mentor.user?.name || 'Mentor'} src={mentor.user?.profilePicture} size="md" online={true} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {mentor.user?.name}
                      </h4>
                      <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                        {mentor.jobTitle || 'Alumni'} {mentor.currentCompany ? `@ ${mentor.currentCompany}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>Branch:</strong> {mentor.branch || mentor.degree || 'Engineering'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>Class of:</strong> {mentor.passingYear || 'N/A'}
                    </div>
                  </div>

                  {mentor.skills && mentor.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                      {mentor.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="c-badge c-badge-blue c-badge-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', gap: '6px' }}
                  >
                    <Icon name="handshake" size={14} />
                    <span>Request Mentorship</span>
                  </button>
                </Card3D>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedMentor)}
        onClose={() => setSelectedMentor(null)}
        title="Request Mentorship"
        subtitle={
          selectedMentor
            ? `Send a guidance request to ${selectedMentor.user?.name} (${selectedMentor.jobTitle || 'Alumni'} @ ${selectedMentor.currentCompany || 'Industry'})`
            : ''
        }
      >
        {successMsg ? (
          <div
            style={{
              background: 'var(--success-light)',
              border: '1px solid var(--success-border)',
              color: 'var(--success)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
              Request Sent!
            </div>
            <div style={{ fontSize: '13px' }}>{successMsg}</div>
          </div>
        ) : (
          <form onSubmit={handleSendRequest}>
            <div className="form-group">
              <label className="form-label">Mentorship Topic</label>
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
                placeholder="Briefly describe your goals, academic background, and what advice you would appreciate..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
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
                {submitting ? 'Submitting...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default Mentorship
