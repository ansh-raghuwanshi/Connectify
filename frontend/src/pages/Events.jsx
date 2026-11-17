import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getEvents, createEvent, registerForEvent } from '../services/event.service'

function Events() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Create event modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: 'Online',
    eventLink: '',
    category: 'General',
    capacity: 100,
  })
  const [creating, setCreating] = useState(false)

  const canCreateEvent = user?.role === 'teacher' || user?.role === 'alumni' || user?.role === 'admin'

  const fetchEventList = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (categoryFilter) params.category = categoryFilter
      const res = await getEvents(params)
      setEvents(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEventList()
  }, [categoryFilter])

  const handleRegisterToggle = async (eventId) => {
    try {
      const res = await registerForEvent(eventId)
      if (res?.data) {
        setEvents(
          events.map((ev) => {
            if (ev._id === eventId) {
              return {
                ...ev,
                isRegistered: res.data.registered,
                attendeesCount: res.data.attendeesCount,
              }
            }
            return ev
          })
        )
      }
    } catch (err) {
      alert(err.message || 'Failed to update event registration')
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await createEvent(formData)
      if (res?.data) {
        setEvents([res.data, ...events])
        setShowCreateModal(false)
        setFormData({
          title: '',
          description: '',
          date: '',
          location: 'Online',
          eventLink: '',
          category: 'General',
          capacity: 100,
        })
      }
    } catch (err) {
      alert(err.message || 'Failed to create event')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '26px' }}>Campus & Alumni Events</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Workshops, career talks, webinars, and alumni homecoming meetups.
          </p>
        </div>

        {canCreateEvent && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            + Host New Event
          </button>
        )}
      </div>

      {/* Filter Categories */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {['', 'Webinar', 'Workshop', 'Career Fair', 'Reunion', 'General'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat || 'All Events'}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📅</div>
          <h3>No events found</h3>
          <p>Check back soon or create the first event for your department!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {events.map((ev) => (
            <div key={ev._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 0, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className="badge badge-blue">{ev.category}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(ev.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h4 style={{ margin: '0 0 8px', fontSize: '18px' }}>{ev.title}</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>
                {ev.description}
              </p>

              <div style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>📍 <strong>Location:</strong> {ev.location}</div>
                <div>👤 <strong>Organizer:</strong> {ev.organizer?.name || 'Faculty / Alumni'}</div>
                <div>👥 <strong>Attendance:</strong> {ev.attendeesCount || 0} / {ev.capacity || 100} registered</div>
              </div>

              <button
                onClick={() => handleRegisterToggle(ev._id)}
                className={`btn btn-sm ${ev.isRegistered ? 'btn-outline' : 'btn-primary'}`}
                style={{ width: '100%' }}
              >
                {ev.isRegistered ? '✓ Registered (Cancel)' : 'Register for Event'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ margin: '0 0 16px' }}>Host Campus Event</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Navigating SDE Interviews in 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Career Fair">Career Fair</option>
                  <option value="Reunion">Reunion</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Platform</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Google Meet or Auditorium 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea"
                  rows="3"
                  required
                  placeholder="Explain event agenda and who should attend..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn btn-primary">
                  {creating ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events
