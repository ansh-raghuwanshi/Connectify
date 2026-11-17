import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAlumni } from '../services/alumni.service'
import { queryAi } from '../services/ai.service'
import { requestMentorship } from '../services/mentorship.service'

function Alumni() {
  const navigate = useNavigate()
  const [alumniList, setAlumniList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search mode: 'standard' | 'ai'
  const [searchMode, setSearchMode] = useState('standard')
  const [aiQueryText, setAiQueryText] = useState('')
  const [aiExplanation, setAiExplanation] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Standard filters
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('')
  const [company, setCompany] = useState('')
  const [passingYear, setPassingYear] = useState('')

  // Mentorship Modal State
  const [selectedAlumniForMentor, setSelectedAlumniForMentor] = useState(null)
  const [mentorTopic, setMentorTopic] = useState('Career Guidance')
  const [mentorMessage, setMentorMessage] = useState('')
  const [mentorSending, setMentorSending] = useState(false)
  const [mentorSuccess, setMentorSuccess] = useState('')

  const fetchStandardAlumni = async () => {
    setLoading(true)
    setError('')
    setAiExplanation('')
    try {
      const params = {}
      if (search) params.search = search
      if (branch) params.branch = branch
      if (company) params.company = company
      if (passingYear) params.passingYear = passingYear
      const res = await getAlumni(params)
      setAlumniList(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load alumni directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchMode === 'standard') {
      fetchStandardAlumni()
    }
  }, [searchMode])

  const handleStandardSearch = (e) => {
    e.preventDefault()
    fetchStandardAlumni()
  }

  const handleAiSearch = async (e) => {
    e.preventDefault()
    if (!aiQueryText.trim()) return

    setAiLoading(true)
    setError('')
    try {
      const res = await queryAi(aiQueryText.trim(), 'alumni_search')
      if (res?.data) {
        setAiExplanation(res.data.explanation || '')
        setAlumniList(res.data.results || [])
      }
    } catch (err) {
      setError(err.message || 'AI search request failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSendMentorshipRequest = async (e) => {
    e.preventDefault()
    if (!selectedAlumniForMentor || !mentorMessage.trim()) return

    setMentorSending(true)
    setMentorSuccess('')
    try {
      await requestMentorship(
        selectedAlumniForMentor.id,
        mentorTopic,
        mentorMessage.trim()
      )
      setMentorSuccess('Mentorship request sent successfully!')
      setTimeout(() => {
        setSelectedAlumniForMentor(null)
        setMentorMessage('')
        setMentorSuccess('')
      }, 1500)
    } catch (err) {
      alert(err.message || 'Failed to send mentorship request')
    } finally {
      setMentorSending(false)
    }
  }

  return (
    <div>
      {/* Top Header & Search Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '26px' }}>Alumni Directory</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Discover and connect with verified graduates of your university
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setSearchMode('standard')}
            className={`btn btn-sm ${searchMode === 'standard' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Filters Search
          </button>
          <button
            onClick={() => setSearchMode('ai')}
            className={`btn btn-sm ${searchMode === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '6px' }}
          >
            <span>✨</span> AI Natural Search
          </button>
        </div>
      </div>

      {/* AI Search Panel */}
      {searchMode === 'ai' && (
        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>✨</span>
            <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '16px' }}>AI-Powered Natural Language Discovery</h4>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Ask in plain English: "Find alumni who work at Microsoft with React experience" or "Show me CS graduates from 2022 available for mentorship"
          </p>

          <form onSubmit={handleAiSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input"
              placeholder="e.g. Find computer science alumni working at Google in backend..."
              value={aiQueryText}
              onChange={(e) => setAiQueryText(e.target.value)}
              style={{ flex: 1, minWidth: '280px' }}
            />
            <button type="submit" disabled={aiLoading || !aiQueryText.trim()} className="btn btn-primary">
              {aiLoading ? 'Searching...' : 'Ask AI'}
            </button>
          </form>

          {aiExplanation && (
            <div style={{ marginTop: '14px', padding: '10px 14px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe', fontSize: '13px', color: 'var(--text-main)' }}>
              🤖 <strong>AI Matching Note:</strong> {aiExplanation}
            </div>
          )}
        </div>
      )}

      {/* Standard Filters Panel */}
      {searchMode === 'standard' && (
        <form onSubmit={handleStandardSearch} className="card" style={{ padding: '18px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label className="form-label">Keyword / Name</label>
              <input
                type="text"
                className="input"
                placeholder="Search by name, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Branch / Major</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Computer Science"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Company</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Microsoft, Amazon"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Graduation Year</label>
              <input
                type="number"
                className="input"
                placeholder="e.g. 2023"
                value={passingYear}
                onChange={(e) => setPassingYear(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setBranch('')
                setCompany('')
                setPassingYear('')
                fetchStandardAlumni()
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Apply Filters
            </button>
          </div>
        </form>
      )}

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Results Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
        <span>Showing {alumniList.length} verified alumni profile{alumniList.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Alumni Cards Grid */}
      {loading || aiLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading alumni records...
        </div>
      ) : alumniList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎓</div>
          <h3>No alumni found</h3>
          <p>Try broadening your search filters or ask AI using different keywords.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {alumniList.map((alumnus) => (
            <div key={alumnus.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px', height: '100%', margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div className="avatar avatar-md">
                  {alumnus.user?.name ? alumnus.user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{alumnus.user?.name}</h4>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {alumnus.jobTitle || 'Alumni'} {alumnus.currentCompany ? `@ ${alumnus.currentCompany}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '14px', flex: 1 }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Branch:</span> {alumnus.branch || alumnus.degree || 'Engineering'}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Class of:</span> {alumnus.passingYear || 'N/A'}
                </div>
                {alumnus.location && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Location:</span> {alumnus.location}
                  </div>
                )}
              </div>

              {/* Skills Tags */}
              {alumnus.skills && alumnus.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {alumnus.skills.slice(0, 4).map((skill, sIdx) => (
                    <span key={sIdx} className="badge badge-blue">
                      {skill}
                    </span>
                  ))}
                  {alumnus.skills.length > 4 && (
                    <span className="badge badge-gray">+{alumnus.skills.length - 4}</span>
                  )}
                </div>
              )}

              {/* Mentorship Availability */}
              {alumnus.mentorshipAvailable && (
                <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600, marginBottom: '14px' }}>
                  ✓ Available for Mentorship
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <button
                  onClick={() => setSelectedAlumniForMentor(alumnus)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  🤝 Mentor Request
                </button>
                <button
                  onClick={() => navigate(`/messages?userId=${alumnus.id}`)}
                  className="btn btn-outline btn-sm"
                >
                  💬 Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mentorship Request Modal */}
      {selectedAlumniForMentor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ margin: '0 0 8px' }}>Request Mentorship</h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Send a guidance request to <strong>{selectedAlumniForMentor.user?.name}</strong> (
              {selectedAlumniForMentor.jobTitle || 'Alumni'} @ {selectedAlumniForMentor.currentCompany || 'N/A'})
            </p>

            {mentorSuccess ? (
              <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                {mentorSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendMentorshipRequest}>
                <div className="form-group">
                  <label className="form-label">Mentorship Topic</label>
                  <select
                    className="select"
                    value={mentorTopic}
                    onChange={(e) => setMentorTopic(e.target.value)}
                  >
                    <option value="Career Guidance">Career Guidance</option>
                    <option value="Resume Review">Resume & Portfolio Review</option>
                    <option value="Technical Interview Prep">Technical Interview Prep</option>
                    <option value="Higher Studies Advice">Higher Studies Advice</option>
                    <option value="Industry Transition">Industry Transition</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Introduction & Message</label>
                  <textarea
                    className="textarea"
                    rows="4"
                    required
                    placeholder="Introduce yourself, your academic background, and what specific questions you have..."
                    value={mentorMessage}
                    onChange={(e) => setMentorMessage(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedAlumniForMentor(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mentorSending || !mentorMessage.trim()}
                    className="btn btn-primary"
                  >
                    {mentorSending ? 'Sending Request...' : 'Submit Request'}
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

export default Alumni
