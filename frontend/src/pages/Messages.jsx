import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getConversationsList,
  getConversation,
  sendMessage,
} from '../services/message.service'
import { getAlumniById } from '../services/alumni.service'
import { getSocket } from '../services/socket.service'
import { Icon } from '../components/common/Icons'
import { Avatar } from '../components/common/Avatar'
import { Badge } from '../components/common/Badge'

export function Messages() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId')

  const [conversations, setConversations] = useState([])
  const [activePartner, setActivePartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [textInput, setTextInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)

  const messagesEndRef = useRef(null)
  const activePartnerRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    activePartnerRef.current = activePartner
    setIsPartnerTyping(false)
  }, [activePartner])

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  const loadConversations = useCallback(async (selectTargetId = null) => {
    try {
      const res = await getConversationsList()
      const convs = res?.data || []
      setConversations(convs)

      const targetId = selectTargetId || targetUserId
      if (targetId) {
        const existing = convs.find((c) => c.partner?._id === targetId)
        if (existing) {
          setActivePartner(existing.partner)
        } else {
          try {
            const uRes = await getAlumniById(targetId)
            if (uRes?.data) {
              setActivePartner({
                _id: uRes.data.id || uRes.data._id,
                name: uRes.data.user?.name || uRes.data.name || 'Alumni Member',
                role: 'alumni',
                currentCompany: uRes.data.currentCompany,
                profilePicture: uRes.data.user?.profilePicture || uRes.data.profilePicture,
              })
            }
          } catch (err) {
            console.warn('Could not load target user profile:', err)
          }
        }
      } else if (convs.length > 0 && !activePartnerRef.current) {
        setActivePartner(convs[0].partner)
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [targetUserId])

  useEffect(() => {
    setLoading(true)
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (!activePartner?._id) return

    let isSubscribed = true

    async function loadThread() {
      try {
        const res = await getConversation(activePartner._id)
        if (isSubscribed && res?.data) {
          setMessages(res.data)
          setTimeout(() => scrollToBottom(false), 50)
        }
      } catch (err) {
        console.error('Failed to load thread:', err)
      }
    }

    loadThread()

    const pollTimer = setInterval(async () => {
      try {
        const res = await getConversation(activePartner._id)
        if (isSubscribed && res?.data) {
          setMessages((prev) => {
            const newMsgs = res.data
            if (
              newMsgs.length !== prev.length ||
              (newMsgs.length > 0 &&
                prev.length > 0 &&
                newMsgs[newMsgs.length - 1]._id !== prev[prev.length - 1]._id)
            ) {
              setTimeout(() => scrollToBottom(true), 60)
              return newMsgs
            }
            return prev
          })
        }
      } catch {
      }
    }, 4000)

    return () => {
      isSubscribed = false
      clearInterval(pollTimer)
    }
  }, [activePartner?._id, scrollToBottom])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    setSocketConnected(socket.connected)

    const onConnect = () => setSocketConnected(true)
    const onDisconnect = () => setSocketConnected(false)

    const onReceiveMessage = (newMsg) => {
      if (!newMsg) return

      const currentPartner = activePartnerRef.current
      const senderId = newMsg.sender?._id || newMsg.sender
      const recipientId = newMsg.recipient?._id || newMsg.recipient

      if (
        currentPartner?._id &&
        (senderId === currentPartner._id || recipientId === currentPartner._id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev
          return [...prev, newMsg]
        })
        setTimeout(() => scrollToBottom(true), 60)
      }

      setConversations((prevConvs) => {
        const otherUserId = senderId === user?._id ? recipientId : senderId
        const existingIdx = prevConvs.findIndex((c) => c.partner?._id === otherUserId)

        if (existingIdx !== -1) {
          const updated = [...prevConvs]
          const existing = updated[existingIdx]
          const isCurrentOpen = currentPartner?._id === otherUserId
          const item = {
            ...existing,
            lastMessage: {
              _id: newMsg._id,
              content: newMsg.content,
              createdAt: newMsg.createdAt,
              sender: newMsg.sender,
              isRead: isCurrentOpen,
            },
          }
          updated.splice(existingIdx, 1)
          return [item, ...updated]
        } else {
          loadConversations()
          return prevConvs
        }
      })
    }

    const onUserTyping = ({ senderId }) => {
      if (activePartnerRef.current?._id === senderId) {
        setIsPartnerTyping(true)
      }
    }

    const onUserStopTyping = ({ senderId }) => {
      if (activePartnerRef.current?._id === senderId) {
        setIsPartnerTyping(false)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('receive_message', onReceiveMessage)
    socket.on('user_typing', onUserTyping)
    socket.on('user_stop_typing', onUserStopTyping)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('receive_message', onReceiveMessage)
      socket.off('user_typing', onUserTyping)
      socket.off('user_stop_typing', onUserStopTyping)
    }
  }, [user?._id, loadConversations, scrollToBottom])

  const handleInputChange = (e) => {
    setTextInput(e.target.value)

    if (!activePartner?._id) return
    const socket = getSocket()
    if (!socket) return

    socket.emit('typing', { recipientId: activePartner._id })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { recipientId: activePartner._id })
    }, 2000)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!textInput.trim() || !activePartner?._id || sending) return

    const content = textInput.trim()
    const targetId = activePartner._id
    setSending(true)
    setTextInput('')

    const socket = getSocket()
    if (socket) {
      socket.emit('stop_typing', { recipientId: targetId })
    }

    try {
      const res = await sendMessage(targetId, content)
      if (res?.data) {
        const sentMsg = res.data

        setMessages((prev) => {
          if (prev.some((m) => m._id === sentMsg._id)) return prev
          return [...prev, sentMsg]
        })
        setTimeout(() => scrollToBottom(true), 50)

        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.partner?._id === targetId)
          if (idx !== -1) {
            const updated = [...prev]
            const item = {
              ...updated[idx],
              lastMessage: {
                _id: sentMsg._id,
                content: sentMsg.content,
                createdAt: sentMsg.createdAt,
                sender: sentMsg.sender,
                isRead: true,
              },
            }
            updated.splice(idx, 1)
            return [item, ...updated]
          } else {
            loadConversations()
            return prev
          }
        })
      }
    } catch (err) {
      alert(err.message || 'Could not send message')
      setTextInput(content)
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter((c) =>
    (c.partner?.name || '').toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div
      className="card messages-container"
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        height: 'calc(100vh - 140px)',
        minHeight: '540px',
        display: 'flex',
        padding: 0,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        style={{
          width: '320px',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
        }}
        className="messages-sidebar"
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="message-square" size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                Messages
              </h3>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: socketConnected ? 'var(--success)' : 'var(--text-light)',
                fontWeight: 600,
              }}
              title={socketConnected ? 'Real-time WebSocket Active' : 'Connecting to real-time service...'}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: socketConnected ? 'var(--success)' : 'var(--text-light)',
                  boxShadow: socketConnected ? '0 0 6px var(--success)' : 'none',
                }}
              />
              <span>{socketConnected ? 'Live' : 'Syncing'}</span>
            </div>
          </div>
          <input
            type="text"
            className="input"
            placeholder="Search conversations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ fontSize: '13px', padding: '8px 12px' }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              Loading messages...
            </div>
          ) : filteredConversations.length === 0 && !activePartner ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            >
              No conversations found. Discover alumni from the directory to start a chat!
            </div>
          ) : (
            filteredConversations.map((conv, cIdx) => {
              const partner = conv.partner
              const isSelected = activePartner?._id === partner?._id
              const isUnread =
                conv.lastMessage &&
                !conv.lastMessage.isRead &&
                conv.lastMessage.sender !== user?._id

              return (
                <div
                  key={partner?._id || `conv-${cIdx}`}
                  onClick={() => setActivePartner(partner)}
                  className="conv-list-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 18px',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Avatar name={partner?.name || 'User'} src={partner?.profilePicture} size="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontWeight: isUnread ? 800 : 700,
                          fontSize: '14px',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {partner?.name}
                      </span>
                      {conv.lastMessage?.createdAt && (
                        <span style={{ fontSize: '10px', color: 'var(--text-light)', flexShrink: 0, marginLeft: '6px' }}>
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: isUnread ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: isUnread ? 600 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastMessage?.content || `${partner?.role || 'User'}`}
                      </span>
                      {isUnread && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            flexShrink: 0,
                            marginLeft: '6px',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-page)',
          minWidth: 0,
        }}
      >
        {activePartner ? (
          <>
            <div
              style={{
                padding: '16px 24px',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <button
                  type="button"
                  onClick={() => setActivePartner(null)}
                  className="btn btn-ghost btn-sm mobile-back-btn"
                  style={{ padding: '6px 10px', fontSize: '13px' }}
                  title="Back to conversations"
                >
                  ← Back
                </button>
                <Avatar name={activePartner.name} src={activePartner?.profilePicture} size="md" online={true} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '15px',
                      color: 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {activePartner.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {isPartnerTyping ? (
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Typing a message...</span>
                    ) : activePartner.currentCompany ? (
                      <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                        Alumni at {activePartner.currentCompany}
                      </span>
                    ) : (
                      <span>{activePartner.role || 'Member'}</span>
                    )}
                  </div>
                </div>
              </div>

              <Badge variant="blue" size="sm">
                Active Thread
              </Badge>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {messages.length === 0 ? (
                <div
                  style={{
                    margin: 'auto',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👋</div>
                  Say hello to <strong style={{ color: 'var(--text-main)' }}>{activePartner.name}</strong>! This is
                  the start of your direct conversation.
                </div>
              ) : (
                messages.map((m, mIdx) => {
                  const isMine =
                    m.sender?._id === user?._id ||
                    m.sender === user?._id ||
                    m.sender?._id?.toString() === user?._id?.toString()

                  return (
                    <div
                      key={m._id || `msg-${mIdx}`}
                      style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        background: isMine ? 'var(--primary-gradient)' : 'var(--bg-card)',
                        color: isMine ? '#ffffff' : 'var(--text-main)',
                        padding: '12px 18px',
                        borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        boxShadow: isMine
                          ? '0 4px 14px rgba(37, 99, 235, 0.28)'
                          : 'var(--shadow-sm)',
                        border: isMine ? 'none' : '1px solid var(--border)',
                        fontSize: '14px',
                        lineHeight: 1.55,
                      }}
                    >
                      <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {m.content}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          marginTop: '5px',
                          color: isMine ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)',
                          textAlign: isMine ? 'right' : 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                          gap: '4px',
                        }}
                      >
                        <span>
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </span>
                        {isMine && (
                          <span style={{ fontSize: '11px', opacity: 0.9 }}>
                            {m.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {isPartnerTyping && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    background: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    padding: '8px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{activePartner.name}</span> is typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              style={{
                padding: '16px 20px',
                background: 'var(--bg-card)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                className="input"
                placeholder={`Message ${activePartner.name}...`}
                value={textInput}
                onChange={handleInputChange}
                style={{ flex: 1, padding: '11px 16px' }}
                autoFocus
              />
              <button
                type="submit"
                disabled={sending || !textInput.trim()}
                className="btn btn-primary"
                style={{ gap: '6px', padding: '11px 20px' }}
              >
                <Icon name="send" size={15} color="#ffffff" />
                <span>{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>💬</div>
            <h4 style={{ margin: '0 0 6px', color: 'var(--text-main)', fontSize: '18px' }}>
              No conversation selected
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Select a conversation on the left to start messaging in real-time.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .conv-list-item:hover {
          background: var(--primary-light) !important;
        }
        .mobile-back-btn {
          display: none !important;
        }
        @media (max-width: 768px) {
          .mobile-back-btn {
            display: inline-flex !important;
          }
          .messages-sidebar {
            width: 100% !important;
            display: ${activePartner ? 'none' : 'flex'} !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Messages
