import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/common/Icons'
import { Avatar } from '../components/common/Avatar'
import { Badge } from '../components/common/Badge'
import {
  getPosts,
  createPost,
  toggleLikePost,
  addComment,
  deletePost,
} from '../services/post.service'

export function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isComposerFocused, setIsComposerFocused] = useState(false)

  const [commentInputs, setCommentInputs] = useState({})
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null)

  const fetchFeed = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getPosts()
      setPosts(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load community updates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [])

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)

      const res = await createPost({ content: content.trim(), tags })
      if (res?.data) {
        setPosts([res.data, ...posts])
        setContent('')
        setTagsInput('')
        setIsComposerFocused(false)
      }
    } catch (err) {
      alert(err.message || 'Could not publish post')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const res = await toggleLikePost(postId)
      if (res?.data) {
        setPosts(
          posts.map((p) => {
            if (p._id === postId) {
              return {
                ...p,
                isLikedByMe: res.data.liked,
                likesCount: res.data.likesCount,
              }
            }
            return p
          })
        )
      }
    } catch (err) {
      console.error('Like failed:', err)
    }
  }

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim()
    if (!text) return

    try {
      const res = await addComment(postId, text)
      if (res?.data) {
        setPosts(
          posts.map((p) => {
            if (p._id === postId) {
              return {
                ...p,
                comments: [...(p.comments || []), res.data],
                commentsCount: (p.commentsCount || 0) + 1,
              }
            }
            return p
          })
        )
        setCommentInputs({ ...commentInputs, [postId]: '' })
      }
    } catch (err) {
      alert(err.message || 'Failed to add comment')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this update?')) return
    try {
      await deletePost(postId)
      setPosts(posts.filter((p) => p._id !== postId))
    } catch (err) {
      alert(err.message || 'Could not delete post')
    }
  }

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #172554 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-10%',
            top: '-50%',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
              Welcome back, {user?.name || 'Member'} 👋
            </h2>
            <Badge
              variant={user?.role === 'alumni' ? 'blue' : user?.role === 'teacher' ? 'yellow' : 'cyan'}
              size="sm"
            >
              {user?.role}
            </Badge>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', maxWidth: '520px', lineHeight: 1.5 }}>
            {user?.role === 'student'
              ? 'Connect with alumni mentors, explore campus workshops, and ask the AI assistant for career advice.'
              : user?.role === 'alumni'
              ? 'Share your industry insights, guide junior students, and stay updated with your alma mater.'
              : 'Coordinate campus events, mentor student initiatives, and engage with university graduates.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          <Link
            to="/ai-assistant"
            className="btn btn-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Icon name="sparkles" size={15} color="#818cf8" />
            <span>Ask Connectify AI</span>
          </Link>
          <Link
            to="/alumni"
            className="btn btn-primary btn-sm"
            style={{ background: 'var(--primary)', color: '#ffffff' }}
          >
            <Icon name="graduation-cap" size={15} />
            <span>Discover Alumni</span>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '28px',
          alignItems: 'start',
        }}
        className="feed-grid-layout"
      >
        <div style={{ minWidth: 0 }}>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <Avatar name={user?.name} src={user?.profilePicture} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <form onSubmit={handleCreatePost}>
                  <textarea
                    className="textarea"
                    rows={isComposerFocused ? 3 : 2}
                    placeholder="Share an achievement, job opening, project, or question..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setIsComposerFocused(true)}
                    required
                    style={{
                      resize: 'none',
                      marginBottom: '12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                    }}
                  />

                  {isComposerFocused && (
                    <div style={{ marginBottom: '12px' }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="Add tags separated by comma (e.g. hiring, react, hackathon)"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        style={{ fontSize: '13px', padding: '8px 12px' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', color: 'var(--text-light)', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="tag" size={13} />
                        <span>Tags optional</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isComposerFocused && (
                        <button
                          type="button"
                          onClick={() => setIsComposerFocused(false)}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '6px' }}
                      >
                        <Icon name="send" size={14} />
                        <span>{submitting ? 'Publishing...' : 'Publish Update'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-light)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--slate-200)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '120px', height: '14px', background: 'var(--slate-200)', borderRadius: '4px', marginBottom: '6px' }} />
                      <div style={{ width: '80px', height: '10px', background: 'var(--slate-150)', borderRadius: '4px' }} />
                    </div>
                  </div>
                  <div style={{ width: '90%', height: '14px', background: 'var(--slate-150)', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ width: '60%', height: '14px', background: 'var(--slate-150)', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '56px 24px',
                color: 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Icon name="message-square" size={30} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--text-main)' }}>
                No community updates yet
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '14px', maxWidth: '380px', marginInline: 'auto' }}>
                Be the first to share an update, question, or accomplishment with students and alumni!
              </p>
              <button
                onClick={() => setIsComposerFocused(true)}
                className="btn btn-primary btn-sm"
              >
                Start a Discussion
              </button>
            </div>
          ) : (
            posts.map((post) => {
              const isMyPost = post.author?._id === user?._id || user?.role === 'admin'
              const showComments = activeCommentsPostId === post._id

              return (
                <article key={post._id} className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Avatar name={post.author?.name || 'User'} src={post.author?.profilePicture} size="md" />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                            {post.author?.name}
                          </span>
                          <Badge
                            variant={post.author?.role === 'alumni' ? 'blue' : post.author?.role === 'teacher' ? 'yellow' : 'cyan'}
                            size="sm"
                          >
                            {post.author?.role}
                          </Badge>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {post.author?.currentCompany && (
                            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                              {post.author.jobTitle || 'Role'} at {post.author.currentCompany} •{' '}
                            </span>
                          )}
                          <span>
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isMyPost && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="btn-icon"
                        title="Delete this post"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-light)',
                          cursor: 'pointer',
                        }}
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '15px',
                      lineHeight: 1.65,
                      color: 'var(--text-main)',
                      marginBottom: '16px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {post.content}
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--primary)',
                            background: 'var(--primary-light)',
                            padding: '3px 9px',
                            borderRadius: '9999px',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '14px',
                    }}
                  >
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`btn btn-sm ${post.isLikedByMe ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        gap: '6px',
                        background: post.isLikedByMe ? 'rgba(239, 68, 68, 0.1)' : undefined,
                        color: post.isLikedByMe ? '#ef4444' : undefined,
                        borderColor: post.isLikedByMe ? '#fecaca' : undefined,
                      }}
                    >
                      <Icon
                        name={post.isLikedByMe ? 'heart-fill' : 'heart'}
                        size={15}
                        color={post.isLikedByMe ? '#ef4444' : 'currentColor'}
                      />
                      <span>{post.likesCount || 0} Likes</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentsPostId(showComments ? null : post._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <Icon name="message-square" size={15} />
                      <span>{post.comments?.length || post.commentsCount || 0} Comments</span>
                    </button>
                  </div>

                  {showComments && (
                    <div
                      style={{
                        marginTop: '18px',
                        borderTop: '1px solid var(--border)',
                        paddingTop: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        <input
                          type="text"
                          className="input"
                          placeholder="Write a constructive reply..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post._id)
                          }}
                          style={{ fontSize: '13px', padding: '9px 14px' }}
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="btn btn-primary btn-sm"
                        >
                          Reply
                        </button>
                      </div>

                      {post.comments && post.comments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {post.comments.map((c, cIdx) => (
                            <div
                              key={c._id || cIdx}
                              style={{
                                background: 'var(--slate-50)',
                                border: '1px solid var(--border)',
                                padding: '12px 16px',
                                borderRadius: 'var(--radius-md)',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: '4px',
                                }}
                              >
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                                  {c.author?.name || 'User'}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                                  {new Date(c.createdAt || Date.now()).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--slate-700)', lineHeight: 1.5 }}>
                                {c.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-light)',
                            textAlign: 'center',
                            padding: '12px',
                          }}
                        >
                          No comments yet. Start the conversation!
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })
          )}
        </div>

        <aside className="feed-right-rail" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            className="card"
            style={{
              padding: '20px',
              background: 'var(--primary-light)',
              borderColor: 'var(--primary-border)',
              margin: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Icon name="sparkles" size={18} color="var(--primary)" />
              <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)' }}>
                Connectify AI
              </h4>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Looking for someone specific? Ask in natural language:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <Link
                to="/ai-assistant"
                style={{
                  fontSize: '12px',
                  padding: '8px 12px',
                  background: 'var(--badge-blue-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--badge-blue-border)',
                  color: 'var(--badge-blue-text)',
                  fontWeight: 600,
                  display: 'block',
                  transition: 'opacity 0.15s ease',
                }}
              >
                "Find Google alumni mentors" →
              </Link>
              <Link
                to="/ai-assistant"
                style={{
                  fontSize: '12px',
                  padding: '8px 12px',
                  background: 'var(--badge-blue-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--badge-blue-border)',
                  color: 'var(--badge-blue-text)',
                  fontWeight: 600,
                  display: 'block',
                  transition: 'opacity 0.15s ease',
                }}
              >
                "CS graduates from 2023" →
              </Link>
            </div>
            <Link
              to="/ai-assistant"
              className="btn btn-primary btn-sm"
              style={{ width: '100%', fontSize: '12px' }}
            >
              Open AI Assistant
            </Link>
          </div>

          <div className="card" style={{ padding: '20px', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Icon name="handshake" size={18} color="var(--primary)" />
              <h4 style={{ margin: 0, fontSize: '15px' }}>Mentorship Hub</h4>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Browse verified graduates offering resume critiques and technical interview prep.
            </p>
            <Link
              to="/mentorship"
              className="btn btn-outline btn-sm"
              style={{ width: '100%', fontSize: '12px' }}
            >
              Find a Mentor
            </Link>
          </div>

          <div className="card" style={{ padding: '20px', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Icon name="calendar" size={18} color="#0891b2" />
              <h4 style={{ margin: 0, fontSize: '15px' }}>Campus Events</h4>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Workshops, career fairs, and alumni homecoming meetups.
            </p>
            <Link
              to="/events"
              className="btn btn-outline btn-sm"
              style={{ width: '100%', fontSize: '12px' }}
            >
              Explore Events
            </Link>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .feed-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .feed-right-rail {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Home
