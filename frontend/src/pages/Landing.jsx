import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: 'var(--font-family)' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '60px 20px 80px' }}>
        <div className="badge badge-blue" style={{ marginBottom: '16px', padding: '6px 14px', fontSize: '12px' }}>
          Official University Alumni & Student Network
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.15, margin: '0 0 20px' }}>
          Connect with Alumni.<br />
          <span style={{ color: 'var(--primary)' }}>Accelerate Your Career.</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Connectify bridges the gap between current university students, experienced alumni, and faculty.
          Find mentors at top tech companies, register for campus events, and discover career opportunities with AI assistance.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            Get Started Free
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '16px' }}>
            Sign In to Your Account
          </Link>
        </div>
      </section>

      {/* Value Pillars */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '80px' }}>
        <div className="card">
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎓</div>
          <h3 className="card-title">Alumni Discovery</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
            Filter by company (Google, Microsoft, startups), graduation year, department, and engineering skills.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</div>
          <h3 className="card-title">1-on-1 Mentorship</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
            Send mentorship requests for resume reviews, mock interviews, and career navigation advice.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
          <h3 className="card-title">Connectify AI</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
            Natural language alumni search powered by intelligent entity extraction to find exact matches.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
          <h3 className="card-title">Campus Events</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
            Never miss webinars, alumni reunions, career workshops, or departmental networking sessions.
          </p>
        </div>
      </section>

      {/* Role Segmentation */}
      <section style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 36px', textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '28px' }}>A Unified Platform for Everyone on Campus</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 32px' }}>
          Whether you are an aspiring student, a working graduate, or a faculty mentor, Connectify has tailored tools for you.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'left' }}>
          <div style={{ padding: '16px', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--primary)' }}>Students</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Find alumni in your dream companies, ask questions, and request guidance.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--accent)' }}>Alumni</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Give back to your alma mater, mentor junior batches, and stay in touch with professors.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--warning)' }}>Faculty & Teachers</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Host webinars, track alumni career progression, and coordinate campus drives.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
