import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getPosts,
  createPost,
  toggleLikePost,
  addComment,
  deletePost,
} from '../services/post.service'

function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create post state
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Comment state tracking per post
  const [commentInputs, setCommentInputs] = useState({})
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null)

  const fetchFeed = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getPosts()
      setPosts(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load posts')
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
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await deletePost(postId)
      setPosts(posts.filter((p) => p._id !== postId))
    } catch (err) {
      alert(err.message || 'Could not delete post')
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Create Post Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="avatar avatar-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Share an achievement, job opening, project, or question
            </div>
          </div>
        </div>

        <form onSubmit={handleCreatePost}>
          <textarea
            className="textarea"
            rows="3"
            placeholder="What's on your mind? Share updates with students and alumni..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ resize: 'none', marginBottom: '12px' }}
          />

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input"
              placeholder="Tags (e.g. hiring, react, hackathon)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              style={{ flex: 1, padding: '7px 12px', fontSize: '13px' }}
            />
            <button type="submit" disabled={submitting || !content.trim()} className="btn btn-primary btn-sm">
              {submitting ? 'Publishing...' : 'Post Update'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Feed List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading community updates...
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
          <h3>No posts yet</h3>
          <p style={{ margin: 0 }}>Be the first to share an update with your campus community!</p>
        </div>
      ) : (
        posts.map((post) => {
          const isMyPost = post.author?._id === user?._id || user?.role === 'admin'
          const showComments = activeCommentsPostId === post._id

          return (
            <div key={post._id} className="card" style={{ padding: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div className="avatar avatar-md">
                    {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{post.author?.name}</span>
                      <span className={`badge badge-${post.author?.role === 'alumni' ? 'blue' : 'gray'}`}>
                        {post.author?.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {post.author?.currentCompany ? `${post.author.jobTitle || 'Role'} at ${post.author.currentCompany} • ` : ''}
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                {isMyPost && (
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '16px' }}
                    title="Delete post"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Content */}
              <p style={{ fontSize: '15px', lineHeight: 1.6, margin: '0 0 14px', whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {post.tags.map((tag, idx) => (
                    <span key={idx} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button
                  onClick={() => handleLike(post._id)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    color: post.isLikedByMe ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: post.isLikedByMe ? 700 : 500,
                  }}
                >
                  {post.isLikedByMe ? '❤️ Liked' : '🤍 Like'} ({post.likesCount || 0})
                </button>

                <button
                  onClick={() => setActiveCommentsPostId(showComments ? null : post._id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  💬 Comments ({post.comments?.length || post.commentsCount || 0})
                </button>
              </div>

              {/* Comments Drawer */}
              {showComments && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Write a comment..."
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post._id)
                      }}
                      style={{ fontSize: '13px', padding: '8px 12px' }}
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
                        <div key={c._id || cIdx} style={{ background: 'var(--bg-page)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{c.author?.name || 'User'}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                              {new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{c.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-light)', textAlign: 'center', padding: '8px' }}>
                      No comments yet. Start the conversation!
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default Home
