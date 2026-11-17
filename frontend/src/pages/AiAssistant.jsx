import { useState } from 'react'
import { Link } from 'react-router-dom'
import { queryAi, summarizeProfile } from '../services/ai.service'
import { useAuth } from '../context/AuthContext'

function AiAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.name || 'there'}! I am your Connectify AI Assistant. You can ask me to discover alumni with specific skills, batches, or companies, or ask any questions about navigating the platform.`,
      results: [],
      suggestedActions: [
        'Find alumni working at Google',
        'Show graduates available for mentorship',
        'How do I request mentorship?',
      ],
    },
  ])

  const [inputQuery, setInputQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [profileSummary, setProfileSummary] = useState('')

  const handleAsk = async (queryText) => {
    const q = queryText || inputQuery
    if (!q.trim() || loading) return

    const userMessage = { sender: 'user', text: q }
    setMessages((prev) => [...prev, userMessage])
    setInputQuery('')
    setLoading(true)

    try {
      const res = await queryAi(q)
      if (res?.data) {
        const aiMessage = {
          sender: 'ai',
          text: res.data.explanation || 'Here is what I found for your query.',
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
          text: `I encountered an issue processing your query: ${err.message}. Please try a different query or explore the Alumni Directory.`,
          results: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSummarizeMyProfile = async () => {
    setSummaryLoading(true)
    try {
      const res = await summarizeProfile(user?._id)
      if (res?.data?.summary) {
        setProfileSummary(res.data.summary)
      }
    } catch (err) {
      alert(err.message || 'Could not generate summary')
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '26px' }}>✨ Connectify AI Assistant</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Natural language alumni discovery, career guidance, and profile analysis.
          </p>
        </div>

        <button
          onClick={handleSummarizeMyProfile}
          disabled={summaryLoading}
          className="btn btn-outline btn-sm"
        >
          {summaryLoading ? 'Summarizing...' : '⚡ Summarize My Profile'}
        </button>
      </div>

      {profileSummary && (
        <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 600, color: '#166534', fontSize: '14px' }}>AI Career Profile Summary:</span>
            <button
              onClick={() => setProfileSummary('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#14532d', lineHeight: 1.5 }}>{profileSummary}</p>
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="card" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                maxWidth: '85%',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-page)',
                color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                fontSize: '14px',
                lineHeight: 1.5,
                border: m.sender === 'ai' ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>
                {m.sender === 'user' ? 'You' : 'Connectify AI'}
              </div>
              <div>{m.text}</div>
            </div>

            {/* Embedded Real MongoDB Alumni Results */}
            {m.results && m.results.length > 0 && (
              <div style={{ marginTop: '12px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {m.results.map((alumnus) => (
                  <div
                    key={alumnus.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{alumnus.user?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {alumnus.jobTitle || 'Alumni'} {alumnus.currentCompany ? `@ ${alumnus.currentCompany}` : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)', marginBottom: '10px' }}>
                      {alumnus.branch} • Class of {alumnus.passingYear}
                    </div>
                    <Link to={`/alumni`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      View in Directory
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Action Chips */}
            {m.suggestedActions && m.suggestedActions.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {m.suggestedActions.map((act, aIdx) => (
                  <button
                    key={aIdx}
                    onClick={() => handleAsk(act)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px' }}
                  >
                    {act}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '13px' }}>
            Thinking and searching MongoDB records...
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <input
          type="text"
          className="input"
          placeholder="Ask AI anything (e.g. Find alumni working in machine learning in Bangalore)..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading || !inputQuery.trim()} className="btn btn-primary">
          Ask AI
        </button>
      </form>
    </div>
  )
}

export default AiAssistant
