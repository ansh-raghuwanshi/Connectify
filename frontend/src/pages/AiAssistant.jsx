import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { queryAi, summarizeProfile } from '../services/ai.service'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/common/Icons'
import { Avatar } from '../components/common/Avatar'
import { Card3D } from '../components/common/Card3D'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'

export function AiAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.name || 'there'}! I am your Connectify AI Assistant. You can ask me to discover alumni with specific technical skills, batches, or companies, or ask any questions about navigating your college network.`,
      results: [],
      suggestedActions: [
        'Find alumni working at Google',
        'Show graduates available for mentorship',
        'Who can help me with technical interview prep?',
        'Find Computer Science alumni from 2023',
      ],
    },
  ])

  const [inputQuery, setInputQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [profileDossier, setProfileDossier] = useState(null)
  const [viewingAlumniDossier, setViewingAlumniDossier] = useState(null)
  const [dossierLoading, setDossierLoading] = useState(false)
  const [copiedOutreach, setCopiedOutreach] = useState(false)
  const [recentQueries, setRecentQueries] = useState([
    'How to prepare for Google SDE interview?',
    'Summarize my career profile',
    'How to message alumni for referrals?',
    'Fullstack developer roadmap 2026',
  ])

  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleAsk = async (queryText) => {
    const q = queryText || inputQuery
    if (!q.trim() || loading) return

    const userMessage = { sender: 'user', text: q }
    setMessages((prev) => [...prev, userMessage])
    setInputQuery('')
    setLoading(true)

    if (!recentQueries.includes(q.trim())) {
      setRecentQueries((prev) => [q.trim(), ...prev.slice(0, 4)])
    }

    try {
      const res = await queryAi(q)
      if (res?.data) {
        const aiMessage = {
          sender: 'ai',
          text: res.data.explanation || 'Here are the matching alumni profiles found in the university database.',
          dossier: res.data.dossier || null,
          results: res.data.results || [],
          suggestedActions: res.data.suggestedActions || [],
        }
        setMessages((prev) => [...prev, aiMessage])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `I encountered an issue processing your query: ${err.message}. Please try rephrasing or search by specific keywords in the Alumni Directory.`,
          results: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const handleSummarizeMyProfile = async () => {
    setSummaryLoading(true)
    try {
      const res = await summarizeProfile(user?._id)
      if (res?.data) {
        setProfileDossier(res.data)
      }
    } catch (err) {
      alert(err.message || 'Could not generate executive profile summary')
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleViewAlumniDossier = async (alumnus) => {
    setDossierLoading(true)
    setViewingAlumniDossier(null)
    setCopiedOutreach(false)
    try {
      const res = await summarizeProfile(alumnus.id)
      if (res?.data) {
        setViewingAlumniDossier(res.data)
      }
    } catch (err) {
      alert(err.message || 'Could not load alumni dossier')
    } finally {
      setDossierLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: `New session started! What would you like to explore across your college alumni network today?`,
        results: [],
        suggestedActions: [
          'How to prepare for Google SDE interview?',
          'Summarize my career profile & strengths',
          'How to message alumni for referrals?',
          'Show graduates available for 1-on-1 mentorship',
        ],
      },
    ])
    setProfileDossier(null)
  }

  const BENTO_SUGGESTIONS = [
    {
      icon: 'sparkles',
      title: 'Interview Playbook',
      query: 'How to prepare for Google SDE interview?',
      color: '#4f46e5',
      badge: 'Placement AI',
    },
    {
      icon: 'send',
      title: 'Cold Outreach Guide',
      query: 'How to message alumni for referrals?',
      color: '#06b6d4',
      badge: 'Networking',
    },
    {
      icon: 'user',
      title: 'Profile Analysis',
      query: 'Summarize my career profile & strengths',
      color: '#10b981',
      badge: 'Executive Dossier',
    },
    {
      icon: 'handshake',
      title: 'Mentorship Search',
      query: 'Show graduates available for 1-on-1 mentorship',
      color: '#f59e0b',
      badge: '1-on-1 Guidance',
    },
  ]

  return (
    <div
      style={{
        maxWidth: '1160px',
        margin: '0 auto',
        height: 'calc(100vh - 120px)',
        minHeight: '620px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '20px',
      }}
      className="modern-ai-layout"
    >
      <aside
        className="card ai-sidebar"
        style={{
          padding: '20px',
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          borderRadius: '20px',
        }}
      >
        <div>
          <button
            onClick={handleNewChat}
            className="btn btn-primary"
            style={{
              width: '100%',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Icon name="plus" size={16} />
            <span>New AI Chat</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
              Connected to MongoDB
            </span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-light)',
                marginBottom: '10px',
                paddingLeft: '4px',
              }}
            >
              Suggested Queries
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon name="sparkles" size={13} color="var(--primary)" style={{ marginRight: '6px' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{q}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '14px',
            borderRadius: '14px',
            background: 'var(--slate-50)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Icon name="sparkles" size={15} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              Profile Intelligence
            </span>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Generate an executive summary of your background using AI.
          </p>
          <button
            onClick={handleSummarizeMyProfile}
            disabled={summaryLoading}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', fontSize: '12px', padding: '6px' }}
          >
            {summaryLoading ? 'Analyzing...' : '⚡ Summarize Profile'}
          </button>
        </div>
      </aside>

      <main
        className="card"
        style={{
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
              }}
            >
              <Icon name="sparkles" size={16} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>
                Connectify AI Studio
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Natural Language Alumni Discovery & Career Intelligence
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Badge variant="blue" size="sm">
              Live Neural Search
            </Badge>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {profileDossier && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--primary-border)',
                borderRadius: '18px',
                padding: '22px 26px',
                boxShadow: 'var(--shadow-md)',
                animation: 'fadeIn 0.25s ease-out',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '16px' }}>
                        Executive Profile Dossier: {profileDossier.name}
                      </span>
                      <Badge variant="blue" size="sm">
                        {profileDossier.seniorityLabel || 'Analyzed'}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                      {profileDossier.headline}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setProfileDossier(null)}
                  className="btn-icon"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Dismiss Dossier"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.65, marginBottom: '16px', whiteSpace: 'pre-line' }}>
                {profileDossier.executiveSummary || profileDossier.summary}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '14px',
                }}
              >
                {profileDossier.strengths && profileDossier.strengths.length > 0 && (
                  <div style={{ background: 'var(--success-light)', border: '1px solid var(--success-border)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--success)', marginBottom: '6px' }}>
                      🌟 Core Profile Strengths
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {profileDossier.strengths.map((st, sIdx) => (
                        <li key={sIdx}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {profileDossier.suggestions && profileDossier.suggestions.length > 0 && (
                  <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning-border)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--warning)', marginBottom: '6px' }}>
                      💡 Optimization Opportunities
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {profileDossier.suggestions.map((sg, gIdx) => (
                        <li key={gIdx}>{sg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div style={{ margin: '16px 0 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'var(--primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    margin: '0 auto 16px',
                    boxShadow: 'var(--shadow-glow)',
                    animation: 'floatSlow 3s infinite ease-in-out',
                  }}
                >
                  <Icon name="sparkles" size={32} color="#ffffff" />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800 }}>
                  What would you like to discover?
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                  Search for graduates by technical stacks, target companies, or mentorship availability
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '14px',
                }}
              >
                {BENTO_SUGGESTIONS.map((item, idx) => (
                  <Card3D
                    key={idx}
                    onClick={() => handleAsk(item.query)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      padding: '18px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: `${item.color}15`,
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name={item.icon} size={16} />
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                        {item.badge}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      "{item.query}"
                    </div>
                  </Card3D>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: m.sender === 'user' ? '75%' : '88%',
                  padding: '16px 20px',
                  borderRadius: m.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: m.sender === 'user' ? 'var(--primary-gradient)' : 'var(--bg-card)',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                  border: m.sender === 'ai' ? '1px solid var(--border)' : 'none',
                  boxShadow: m.sender === 'user' ? '0 4px 14px rgba(37, 99, 235, 0.28)' : 'var(--shadow-sm)',
                  fontSize: '14px',
                  lineHeight: 1.65,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    marginBottom: '8px',
                    color: m.sender === 'user' ? 'rgba(255, 255, 255, 0.85)' : 'var(--primary)',
                  }}
                >
                  {m.sender === 'user' ? (
                    <>
                      <Avatar name={user?.name || 'You'} src={user?.profilePicture} size="sm" />
                      <span>{user?.name || 'You'}</span>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          background: 'var(--primary)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="sparkles" size={12} color="#ffffff" />
                      </div>
                      <span>Connectify AI</span>
                    </>
                  )}
                </div>

                <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>

              {m.results && m.results.length > 0 && (
                <div
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '14px',
                  }}
                >
                  {m.results.map((alumnus) => (
                    <Card3D
                      key={alumnus.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '16px',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                        <Avatar name={alumnus.user?.name || 'Alumni'} src={alumnus.user?.profilePicture} size="sm" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                            {alumnus.user?.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>
                            {alumnus.jobTitle || 'Alumni'} {alumnus.currentCompany ? `@ ${alumnus.currentCompany}` : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        {alumnus.branch} • Class of {alumnus.passingYear}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleViewAlumniDossier(alumnus)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, gap: '4px', fontSize: '11px', padding: '6px 8px' }}
                          title="Generate AI Profile Summary"
                        >
                          <Icon name="sparkles" size={12} color="var(--primary)" />
                          <span>AI Summary</span>
                        </button>
                        <Link
                          to={`/messages?userId=${alumnus.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ gap: '4px', fontSize: '11px', padding: '6px 10px' }}
                          title={`Direct message ${alumnus.user?.name}`}
                        >
                          <Icon name="message-square" size={12} />
                          <span>Chat</span>
                        </Link>
                        <Link
                          to="/alumni"
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '11px', padding: '6px 10px' }}
                        >
                          <span>Directory →</span>
                        </Link>
                      </div>
                    </Card3D>
                  ))}
                </div>
              )}

              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {m.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleAsk(act)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px', borderRadius: '9999px', padding: '5px 14px' }}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--slate-50)',
                border: '1px solid var(--border)',
                padding: '12px 18px',
                borderRadius: '18px 18px 18px 4px',
                color: 'var(--primary)',
                fontSize: '13px',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid var(--primary)',
                  borderTopColor: 'transparent',
                  animation: 'radarSweep 1s linear infinite',
                }}
              />
              <span>Querying university database and extracting matching profiles...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAsk()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '9999px',
              padding: '6px 8px 6px 18px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Icon name="sparkles" size={17} color="var(--primary)" />

            <input
              ref={textareaRef}
              type="text"
              placeholder="Ask Connectify AI (e.g. Find 2022 CS graduates working at Google in Bangalore)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
              }}
            />

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="btn btn-primary"
              style={{
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title="Send prompt"
            >
              <Icon name="send" size={15} color="#ffffff" />
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: 'var(--text-light)',
              marginTop: '8px',
            }}
          >
            Connectify AI extracts entities from live university MongoDB records. Press Enter to send.
          </div>
        </div>
      </main>

      <Modal
        isOpen={Boolean(viewingAlumniDossier)}
        onClose={() => setViewingAlumniDossier(null)}
        title="AI Executive Profile Dossier"
        subtitle={viewingAlumniDossier ? viewingAlumniDossier.name : ''}
        maxWidth="620px"
      >
        {viewingAlumniDossier && (
          <div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <Avatar name={viewingAlumniDossier.name} size="md" />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>
                    {viewingAlumniDossier.name}
                  </span>
                  <Badge variant="blue" size="sm">
                    {viewingAlumniDossier.seniorityLabel || 'Alumni'}
                  </Badge>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                  {viewingAlumniDossier.headline}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Executive Overview
              </div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                {viewingAlumniDossier.executiveSummary || viewingAlumniDossier.summary}
              </p>
            </div>

            {viewingAlumniDossier.competencies?.all?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Key Competencies
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {viewingAlumniDossier.competencies.all.map((sk, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        background: 'var(--badge-blue-bg)',
                        color: 'var(--badge-blue-text)',
                        border: '1px solid var(--badge-blue-border)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewingAlumniDossier.tailoredOutreach && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Tailored Cold Message Draft
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {viewingAlumniDossier.tailoredOutreach}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingAlumniDossier.tailoredOutreach || '')
                  setCopiedOutreach(true)
                  setTimeout(() => setCopiedOutreach(false), 2000)
                }}
                className="btn btn-secondary btn-sm"
              >
                {copiedOutreach ? 'Copied!' : 'Copy Outreach Message'}
              </button>
              <Link
                to={`/messages?userId=${viewingAlumniDossier.userId}`}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <Icon name="message-square" size={13} />
                <span>Message Alumni</span>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @media (max-width: 860px) {
          .modern-ai-layout {
            grid-template-columns: 1fr !important;
          }
          .ai-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default AiAssistant
