import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getEvents, createEvent, registerForEvent } from '../services/event.service'
import { Icon } from '../components/common/Icons'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { Card3D } from '../components/common/Card3D'

export function Events() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

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

  const canCreateEvent =
    user?.role === 'teacher' || user?.role === 'alumni' || user?.role === 'admin'

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
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Campus & Alumni Events</h2>
            <Badge variant="cyan" size="sm">
              Live Schedule
            </Badge>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Interactive workshops, career panels, tech webinars, and alumni meetups
          </p>
        </div>

        {canCreateEvent && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ gap: '6px' }}
          >
            <Icon name="calendar" size={16} />
            <span>+ Host Campus Event</span>
          </button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '24px',
        }}
      >
        {['', 'Webinar', 'Workshop', 'Career Fair', 'Reunion', 'General'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '9999px', padding: '7px 16px', whiteSpace: 'nowrap' }}
          >
            {cat || 'All Categories'}
          </button>
        ))}
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading scheduled campus events...
        </div>
      ) : events.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '64px 24px',
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
            <Icon name="calendar" size={28} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '19px', color: 'var(--text-main)' }}>
            No upcoming events found
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Check back soon or host the first event for your batch or department!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {events.map((ev) => {
            const eventDate = new Date(ev.date)
            const monthStr = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()
            const dayStr = eventDate.getDate()

            return (
              <Card3D
                key={ev._id}
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
                  <div
                    style={{
                      background: 'var(--badge-blue-bg)',
                      border: '1px solid var(--badge-blue-border)',
                      borderRadius: '12px',
                      padding: '6px 12px',
                      textAlign: 'center',
                      lineHeight: 1.1,
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--badge-blue-text)', letterSpacing: '0.05em' }}>
                      {monthStr}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                      {dayStr}
                    </div>
                  </div>

                  <Badge variant="blue" size="sm">
                    {ev.category}
                  </Badge>
                </div>

                <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {ev.title}
                </h3>

                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    margin: '0 0 18px',
                    flex: 1,
                  }}
                >
                  {ev.description}
                </p>

                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginBottom: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="map-pin" size={15} color="var(--primary)" />
                    <span>
                      <strong>Location:</strong> {ev.location}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="user" size={15} color="var(--primary)" />
                    <span>
                      <strong>Host:</strong> {ev.organizer?.name || 'Faculty / Alumni Council'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="users" size={15} color="var(--primary)" />
                    <span>
                      <strong>Attendance:</strong> {ev.attendeesCount || 0} / {ev.capacity || 100} RSVPs
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRegisterToggle(ev._id)}
                  className={`btn btn-sm ${ev.isRegistered ? 'btn-outline' : 'btn-primary'}`}
                  style={{
                    width: '100%',
                    gap: '6px',
                    borderColor: ev.isRegistered ? 'var(--success)' : undefined,
                    color: ev.isRegistered ? 'var(--success)' : undefined,
                  }}
                >
                  <Icon name={ev.isRegistered ? 'check' : 'calendar'} size={15} />
                  <span>{ev.isRegistered ? '✓ Registered (Click to Cancel)' : 'RSVP for Event'}</span>
                </button>
              </Card3D>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Host Campus Event"
        subtitle="Schedule a webinar, workshop, or reunion for your college community"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Navigating SDE Interviews & Distributed Systems"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
            }}
          >
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
          </div>

          <div className="form-group">
            <label className="form-label">Location / Platform Link</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Google Meet or Auditorium 2"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Agenda</label>
            <textarea
              className="textarea"
              rows="3"
              required
              placeholder="Detail the session topics, who should attend, and key takeaways..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn btn-primary">
              {creating ? 'Publishing Event...' : 'Publish Campus Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Events
