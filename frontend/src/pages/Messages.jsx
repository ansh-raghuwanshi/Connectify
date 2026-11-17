import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getConversationsList,
  getConversation,
  sendMessage,
} from '../services/message.service'
import { getAlumniById } from '../services/alumni.service'

function Messages() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId')

  const [conversations, setConversations] = useState([])
  const [activePartner, setActivePartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [textInput, setTextInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load conversations list
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await getConversationsList()
        const convs = res?.data || []
        setConversations(convs)

        // If targetUserId passed in URL, set active partner or fetch partner details
        if (targetUserId) {
          const existing = convs.find((c) => c.partner?._id === targetUserId)
          if (existing) {
            setActivePartner(existing.partner)
          } else {
            // Fetch alumni profile to start new thread
            try {
              const uRes = await getAlumniById(targetUserId)
              if (uRes?.data) {
                setActivePartner({
                  _id: uRes.data.id,
                  name: uRes.data.user?.name,
                  role: 'alumni',
                  currentCompany: uRes.data.currentCompany,
                })
              }
            } catch (err) {
              console.warn('Could not load target user profile:', err)
            }
          }
        } else if (convs.length > 0 && !activePartner) {
          setActivePartner(convs[0].partner)
        }
      } catch (err) {
        console.error('Failed to load conversations:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [targetUserId])

  // Load message stream when activePartner changes
  useEffect(() => {
    if (!activePartner?._id) return

    async function loadThread() {
      try {
        const res = await getConversation(activePartner._id)
        setMessages(res?.data || [])
        setTimeout(scrollToBottom, 100)
      } catch (err) {
        console.error('Failed to load thread:', err)
      }
    }

    loadThread()
  }, [activePartner])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!textInput.trim() || !activePartner?._id || sending) return

    const content = textInput.trim()
    setSending(true)
    try {
      const res = await sendMessage(activePartner._id, content)
      if (res?.data) {
        setMessages([...messages, res.data])
        setTextInput('')
        setTimeout(scrollToBottom, 50)
      }
    } catch (err) {
      alert(err.message || 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', height: 'calc(100vh - 160px)', display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#ffffff', overflow: 'hidden' }}>
      {/* Left Panel: Conversation List */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '16px' }}>
          Conversations
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Loading messages...
            </div>
          ) : conversations.length === 0 && !activePartner ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No conversations yet. Connect with alumni from the directory to start a chat!
            </div>
          ) : (
            conversations.map((conv) => {
              const partner = conv.partner
              const isSelected = activePartner?._id === partner?._id

              return (
                <div
                  key={partner?._id || Math.random()}
                  onClick={() => setActivePartner(partner)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                >
                  <div className="avatar avatar-md">
                    {partner?.name ? partner.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {partner?.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastMessage?.content || `${partner?.role || 'User'}`}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Panel: Chat Stream */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
        {activePartner ? (
          <>
            {/* Thread Header */}
            <div style={{ padding: '14px 20px', background: '#ffffff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar avatar-sm">
                {activePartner.name ? activePartner.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{activePartner.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {activePartner.currentCompany ? `Alumni at ${activePartner.currentCompany}` : activePartner.role}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  Say hello to {activePartner.name}! This is the beginning of your conversation.
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender?._id === user?._id || m.sender === user?._id
                  return (
                    <div
                      key={m._id || Math.random()}
                      style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        background: isMine ? 'var(--primary)' : '#ffffff',
                        color: isMine ? '#ffffff' : 'var(--text-main)',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)',
                        fontSize: '14px',
                        lineHeight: 1.4,
                      }}
                    >
                      <div>{m.content}</div>
                      <div
                        style={{
                          fontSize: '10px',
                          marginTop: '4px',
                          color: isMine ? '#bfdbfe' : 'var(--text-light)',
                          textAlign: isMine ? 'right' : 'left',
                        }}
                      >
                        {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} style={{ padding: '14px 20px', background: '#ffffff', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input"
                placeholder={`Message ${activePartner.name}...`}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" disabled={sending || !textInput.trim()} className="btn btn-primary">
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a conversation on the left to start messaging.
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
