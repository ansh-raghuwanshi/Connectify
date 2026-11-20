import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAlumni } from '../services/alumni.service'
import { queryAi, summarizeProfile } from '../services/ai.service'
import { requestMentorship } from '../services/mentorship.service'
import { Icon } from '../components/common/Icons'
import { Card3D } from '../components/common/Card3D'
import { Avatar } from '../components/common/Avatar'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { EmptyState } from '../components/common/EmptyState'

export function Alumni() {
  const navigate = useNavigate()
  const [alumniList, setAlumniList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchMode, setSearchMode] = useState('standard')
  const [aiQueryText, setAiQueryText] = useState('')
  const [aiExplanation, setAiExplanation] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('')
  const [company, setCompany] = useState('')
  const [passingYear, setPassingYear] = useState('')

  const [selectedAlumniForMentor, setSelectedAlumniForMentor] = useState(null)
  const [mentorTopic, setMentorTopic] = useState('Career Guidance')
  const [mentorMessage, setMentorMessage] = useState('')
  const [mentorSending, setMentorSending] = useState(false)
  const [mentorSuccess, setMentorSuccess] = useState('')

  const [summaryAlumnus, setSummaryAlumnus] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryTab, setSummaryTab] = useState('overview')
  const [copiedOutreach, setCopiedOutreach] = useState(false)

  const handleOpenAiSummary = async (alumnus) => {
    setSummaryAlumnus(alumnus)
    setSummaryLoading(true)
    setSummaryData(null)
    setSummaryTab('overview')
    setCopiedOutreach(false)
    try {
      const res = await summarizeProfile(alumnus.id)
      if (res?.data) {
        setSummaryData(res.data)
      }
    } catch (err) {
      console.warn('AI summary fetch error:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleCopyOutreach = () => {
    if (summaryData?.tailoredOutreach) {
      navigator.clipboard.writeText(summaryData.tailoredOutreach)
      setCopiedOutreach(true)
      setTimeout(() => setCopiedOutreach(false), 2500)
    }
  }

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

  const handleAiSearch = async (e, suggestedPrompt = null) => {
    if (e) e.preventDefault()
    const query = suggestedPrompt || aiQueryText
    if (!query.trim()) return

    if (suggestedPrompt) {
      setAiQueryText(suggestedPrompt)
    }

    setAiLoading(true)
    setError('')
    try {
      const res = await queryAi(query.trim(), 'alumni_search')
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '18px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Alumni Directory</h2>
            <Badge variant="blue" size="sm">
              {alumniList.length} Verified
            </Badge>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Discover and connect with verified graduates of your university across tech and business
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: 'var(--slate-100)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setSearchMode('standard')}
            className={`btn btn-sm ${searchMode === 'standard' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '9999px', padding: '6px 16px' }}
          >
            <Icon name="filter" size={14} />
            <span>Structured Filters</span>
          </button>
          <button
            onClick={() => setSearchMode('ai')}
            className={`btn btn-sm ${searchMode === 'ai' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '9999px', padding: '6px 16px', gap: '6px' }}
          >
            <Icon name="sparkles" size={14} color={searchMode === 'ai' ? '#ffffff' : 'var(--primary)'} />
            <span>AI Natural Search</span>
          </button>
        </div>
      </div>

      {searchMode === 'ai' && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #0b0f19 0%, #172554 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#ffffff',
            padding: '30px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="sparkles" size={18} color="#818cf8" />
            </div>
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 700 }}>
              AI Natural Language Alumni Discovery
            </h3>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '700px' }}>
            Ask in plain conversational English. Connectify AI will parse your criteria against our database:
          </p>

          <form onSubmit={(e) => handleAiSearch(e)} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input"
              placeholder="e.g. Find computer science alumni working at Google who do React..."
              value={aiQueryText}
              onChange={(e) => setAiQueryText(e.target.value)}
              style={{
                flex: 1,
                minWidth: '280px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
              }}
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQueryText.trim()}
              className="btn btn-gradient"
              style={{ padding: '10px 24px' }}
            >
              {aiLoading ? (
                <>
                  <Icon name="refresh" size={15} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Icon name="sparkles" size={15} />
                  <span>Ask AI</span>
                </>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>Suggestions:</span>
            {[
              'Alumni working at Microsoft',
              'CS graduates available for mentorship',
              'Engineers in Bangalore',
              'Batch of 2023 working on AI',
            ].map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAiSearch(null, s)}
                style={{
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '5px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {aiExplanation && (
            <div
              style={{
                marginTop: '20px',
                padding: '14px 18px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                fontSize: '13px',
                color: '#e0e7ff',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <Icon name="sparkles" size={16} color="#818cf8" style={{ marginTop: '2px' }} />
              <div>
                <strong>AI Matching Analysis:</strong> {aiExplanation}
              </div>
            </div>
          )}
        </div>
      )}

      {searchMode === 'standard' && (
        <form onSubmit={handleStandardSearch} className="card" style={{ padding: '22px', marginBottom: '28px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '18px',
            }}
          >
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
              <label className="form-label">Company / Organization</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Google, Microsoft"
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

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
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
            <button type="submit" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
              <Icon name="search" size={14} />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      )}

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

      {loading || aiLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '24px',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card" style={{ padding: '24px', minHeight: '280px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--slate-200)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: '130px', height: '16px', background: 'var(--slate-200)', borderRadius: '4px', marginBottom: '6px' }} />
                  <div style={{ width: '90px', height: '12px', background: 'var(--slate-150)', borderRadius: '4px' }} />
                </div>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'var(--slate-150)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ width: '80%', height: '12px', background: 'var(--slate-150)', borderRadius: '4px', marginBottom: '20px' }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '60px', height: '22px', background: 'var(--slate-150)', borderRadius: '9999px' }} />
                <div style={{ width: '70px', height: '22px', background: 'var(--slate-150)', borderRadius: '9999px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : alumniList.length === 0 ? (
        <EmptyState
          title="No Matching Alumni Found"
          message="We couldn't find any verified graduates matching your current query. Try searching for another tech stack, company, graduation year, or reset your filters."
          onReset={() => {
            setSearch('')
            setBranch('')
            setCompany('')
            setPassingYear('')
            setAiQueryText('')
            fetchStandardAlumni()
          }}
          onSuggestionClick={(s) => {
            if (searchMode === 'ai') {
              handleAiSearch(null, s)
            } else {
              setSearch(s)
              fetchStandardAlumni()
            }
          }}
          suggestions={['Google', 'Microsoft', 'Amazon', 'Computer Science', 'React', 'Mentorship']}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {alumniList.map((alumnus) => (
            <Card3D
              key={alumnus.id}
              maxTilt={6}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <Avatar
                    name={alumnus.user?.name || 'Alumni'}
                    src={alumnus.user?.profilePicture}
                    size="md"
                    online={alumnus.mentorshipAvailable}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {alumnus.user?.name}
                    </h4>
                    <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                      {alumnus.jobTitle || 'Alumni'} {alumnus.currentCompany ? `@ ${alumnus.currentCompany}` : ''}
                    </div>
                  </div>
                </div>

                <Badge variant="blue" size="sm">
                  {alumnus.passingYear ? `'${String(alumnus.passingYear).slice(-2)}` : 'Alumni'}
                </Badge>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="graduation-cap" size={15} color="var(--primary)" />
                  <span style={{ fontWeight: 500 }}>{alumnus.branch || alumnus.degree || 'Engineering'}</span>
                </div>
                {alumnus.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="map-pin" size={15} color="var(--accent)" />
                    <span>{alumnus.location}</span>
                  </div>
                )}
              </div>

              {alumnus.skills && alumnus.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {alumnus.skills.slice(0, 4).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--badge-blue-text)',
                        background: 'var(--badge-blue-bg)',
                        border: '1px solid var(--badge-blue-border)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {alumnus.skills.length > 4 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--badge-gray-text)',
                        background: 'var(--badge-gray-bg)',
                        border: '1px solid var(--badge-gray-border)',
                        padding: '3px 6px',
                        borderRadius: '6px',
                      }}
                    >
                      +{alumnus.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: alumnus.mentorshipAvailable ? 'var(--badge-green-text)' : 'var(--text-light)',
                  marginBottom: '16px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: alumnus.mentorshipAvailable ? 'var(--badge-green-bg)' : 'var(--badge-gray-bg)',
                  border: alumnus.mentorshipAvailable ? '1px solid var(--badge-green-border)' : '1px solid var(--badge-gray-border)',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: alumnus.mentorshipAvailable ? 'var(--success)' : 'var(--text-light)',
                  }}
                />
                <span>
                  {alumnus.mentorshipAvailable
                    ? 'Available for 1-on-1 Mentorship'
                    : 'Mentorship unavailable'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '16px',
                }}
              >
                <button
                  onClick={() => setSelectedAlumniForMentor(alumnus)}
                  disabled={!alumnus.mentorshipAvailable}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, gap: '6px' }}
                >
                  <Icon name="handshake" size={14} />
                  <span>Request Mentor</span>
                </button>
                <button
                  onClick={() => handleOpenAiSummary(alumnus)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                  title="Generate AI Executive Dossier & Cold Message"
                >
                  <Icon name="sparkles" size={14} color="var(--primary)" />
                  <span>AI Summary</span>
                </button>
                <button
                  onClick={() => navigate(`/messages?userId=${alumnus.id}`)}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '6px' }}
                  title={`Message ${alumnus.user?.name}`}
                >
                  <Icon name="message-square" size={14} />
                  <span>Chat</span>
                </button>
              </div>
            </Card3D>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedAlumniForMentor)}
        onClose={() => setSelectedAlumniForMentor(null)}
        title="Request 1-on-1 Mentorship"
        subtitle={
          selectedAlumniForMentor
            ? `Connect with ${selectedAlumniForMentor.user?.name} (${selectedAlumniForMentor.jobTitle || 'Alumni'} @ ${selectedAlumniForMentor.currentCompany || 'Industry'})`
            : ''
        }
      >
        {mentorSuccess ? (
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
              Request Delivered!
            </div>
            <div style={{ fontSize: '13px' }}>
              The mentor has been notified. You can track this under Mentorship Hub.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMentorshipRequest}>
            <div className="form-group">
              <label className="form-label">Mentorship Focus Topic</label>
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
              <label className="form-label">Introduction & What You'd Like Advice On</label>
              <textarea
                className="textarea"
                rows="4"
                required
                placeholder="Introduce yourself, your branch, your current projects, and specific questions you have for this alumnus..."
                value={mentorMessage}
                onChange={(e) => setMentorMessage(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
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
                {mentorSending ? 'Submitting Request...' : 'Send Mentorship Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(summaryAlumnus)}
        onClose={() => setSummaryAlumnus(null)}
        title="AI Executive Profile Dossier"
        subtitle={
          summaryAlumnus
            ? `Deep Intelligence & Networking Profile for ${summaryAlumnus.user?.name}`
            : ''
        }
        maxWidth="640px"
      >
        {summaryLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                animation: 'pulseGlow 2s infinite ease-in-out',
              }}
            >
              <Icon name="sparkles" size={24} color="var(--primary)" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)', marginBottom: '4px' }}>
              Synthesizing Executive Dossier...
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Analyzing career milestones, technical competency clusters, and mentorship focus.
            </p>
          </div>
        ) : summaryData ? (
          <div>
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <Avatar
                name={summaryData.name}
                src={summaryAlumnus?.user?.profilePicture}
                size="lg"
                online={summaryAlumnus?.mentorshipAvailable}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {summaryData.name}
                  </h4>
                  <Badge variant="blue" size="sm">
                    {summaryData.seniorityLabel || 'Alumni Member'}
                  </Badge>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', marginTop: '3px' }}>
                  {summaryData.headline}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '10px',
                marginBottom: '18px',
              }}
            >
              {[
                { id: 'overview', label: 'Executive Overview', icon: 'sparkles' },
                { id: 'mentorship', label: 'Mentorship Scope', icon: 'handshake' },
                { id: 'outreach', label: 'Draft Cold Message', icon: 'send' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSummaryTab(tab.id)}
                  className={`btn btn-sm ${summaryTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ gap: '6px', fontSize: '12px' }}
                >
                  <Icon name={tab.icon} size={13} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {summaryTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Executive Biography & Impact
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.65,
                      color: 'var(--text-main)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {summaryData.executiveSummary}
                  </div>
                </div>

                {summaryData.competencies && summaryData.competencies.all?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Key Technical Competencies
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {summaryData.competencies.all.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--badge-blue-text)',
                            background: 'var(--badge-blue-bg)',
                            border: '1px solid var(--badge-blue-border)',
                            padding: '4px 10px',
                            borderRadius: '8px',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {summaryTab === 'mentorship' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {summaryData.name} can provide high-value, actionable advisory across these key areas:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {summaryData.mentorshipFocus?.map((item, mIdx) => (
                    <div
                      key={mIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        fontSize: '13px',
                        color: 'var(--text-main)',
                      }}
                    >
                      <Icon name="check" size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                {summaryAlumnus?.mentorshipAvailable && (
                  <button
                    onClick={() => {
                      const al = summaryAlumnus
                      setSummaryAlumnus(null)
                      setSelectedAlumniForMentor(al)
                    }}
                    className="btn btn-primary"
                    style={{ marginTop: '8px', gap: '6px' }}
                  >
                    <Icon name="handshake" size={15} />
                    <span>Proceed to Book 1-on-1 Mentorship</span>
                  </button>
                )}
              </div>
            )}

            {summaryTab === 'outreach' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  A personalized, high-converting outreach message crafted specifically for {summaryData.name}:
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                  }}
                >
                  {summaryData.tailoredOutreach}
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    onClick={handleCopyOutreach}
                    className="btn btn-secondary"
                    style={{ gap: '6px' }}
                  >
                    <Icon name={copiedOutreach ? 'check' : 'copy'} size={14} color={copiedOutreach ? 'var(--success)' : 'currentColor'} />
                    <span>{copiedOutreach ? 'Copied to Clipboard!' : 'Copy Message'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const id = summaryAlumnus.id
                      setSummaryAlumnus(null)
                      navigate(`/messages?userId=${id}`)
                    }}
                    className="btn btn-primary"
                    style={{ gap: '6px' }}
                  >
                    <Icon name="message-square" size={14} />
                    <span>Open in Direct Chat →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Could not generate dossier. Please try again.
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Alumni
