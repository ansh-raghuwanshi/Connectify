import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/common/Icons'
import { Card3D } from '../components/common/Card3D'
import { Network3DCanvas } from '../components/common/Network3DCanvas'
import { Badge } from '../components/common/Badge'

export function Landing() {
  const [activeTab, setActiveTab] = useState('discovery')

  const FEATURE_PILLARS = [
    {
      id: 'discovery',
      icon: 'graduation-cap',
      title: 'Alumni Discovery',
      badge: 'Verified Directory',
      desc: 'Connect with graduates working at Google, Microsoft, Stripe, Amazon, and cutting-edge startups. Filter by company, graduation year, degree, and engineering skillsets.',
      highlights: ['Custom search by industry & role', 'Direct LinkedIn profile links', 'Graduation batch verification'],
      cardRole: 'Senior Software Engineer @ Google',
      cardName: 'Sarah Chen, Class of 2021',
      cardTags: ['Distributed Systems', 'Go', 'Kubernetes'],
    },
    {
      id: 'mentorship',
      icon: 'handshake',
      title: '1-on-1 Mentorship',
      badge: 'Career Guidance',
      desc: 'Gain real-world interview prep, resume critiques, and tactical career insights from alumni who walked the same campus corridors and succeeded in tech.',
      highlights: ['Structured mentorship requests', 'Mock interview scheduling', 'Portfolio & resume reviews'],
      cardRole: 'Engineering Manager @ Microsoft',
      cardName: 'David Miller, Class of 2018',
      cardTags: ['System Design', 'Leadership', 'Career Growth'],
    },
    {
      id: 'ai',
      icon: 'sparkles',
      title: 'Connectify AI Engine',
      badge: 'Natural Language Search',
      desc: 'Ask our AI in conversational English to find alumni matching your exact goals: "Find 2022 CS graduates working on machine learning in Bangalore" and get instant verified results.',
      highlights: ['Instant MongoDB profile parsing', 'AI Career profile summarization', 'Context-aware discovery suggestions'],
      cardRole: 'AI Research Scientist @ OpenAI Fellow',
      cardName: 'Ananya Gupta, Class of 2022',
      cardTags: ['PyTorch', 'Transformers', 'NLP'],
    },
    {
      id: 'events',
      icon: 'calendar',
      title: 'Campus & Alumni Events',
      badge: 'Active Community',
      desc: 'Never miss an alumni homecoming, tech webinar, career fair, or department workshop. RSVP with one click and interact with speakers.',
      highlights: ['Live webinars and Q&A sessions', 'Departmental reunions', 'Host rights for faculty & alumni'],
      cardRole: 'Organized by Faculty & Alumni Council',
      cardName: 'Tech Career Fair & SDE Workshop',
      cardTags: ['Webinar', 'Online', 'Q&A'],
    },
  ]

  const activeFeature = FEATURE_PILLARS.find((f) => f.id === activeTab) || FEATURE_PILLARS[0]

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', overflowX: 'hidden' }}>
      <section
        style={{
          position: 'relative',
          padding: '48px 24px 80px',
          background: 'linear-gradient(180deg, #070a13 0%, #0b0f19 50%, #0f172a 100%)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-20%',
            left: '20%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '30%',
            right: '-10%',
            width: '550px',
            height: '550px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 70%)',
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '48px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                marginBottom: '24px',
              }}
            >
              <Icon name="sparkles" size={15} color="#818cf8" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#c7d2fe', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Next-Gen University Alumni Network
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(38px, 5.5vw, 62px)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.035em',
                margin: '0 0 24px',
                color: '#ffffff',
              }}
            >
              Your College Network.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                }}
              >
                Your Future Opportunities.
              </span>
            </h1>

            <p
              style={{
                fontSize: '18px',
                lineHeight: 1.65,
                color: '#cbd5e1',
                marginBottom: '36px',
                maxWidth: '540px',
              }}
            >
              Connectify bridges university students, experienced alumni, and faculty into a single, verified ecosystem.
              Discover mentors at leading tech companies, join campus workshops, and supercharge your career using intelligent AI.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                to="/register"
                className="btn btn-gradient btn-lg"
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.45)',
                }}
              >
                Join Connectify Free →
              </Link>

              <Link
                to="/login"
                className="btn btn-outline btn-lg"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '14px 28px',
                  fontSize: '16px',
                }}
              >
                Sign In to Account
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginTop: '48px',
                paddingTop: '32px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  1,200+
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500, marginTop: '2px' }}>Verified Alumni</div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                  98%
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500, marginTop: '2px' }}>Mentorship Response</div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#818cf8', fontFamily: 'var(--font-heading)' }}>
                  50+
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500, marginTop: '2px' }}>Top Tech Companies</div>
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'radial-gradient(ellipse at center, rgba(17, 24, 39, 0.95) 0%, rgba(7, 10, 19, 0.98) 100%)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), inset 0 0 2px rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
            }}
          >
            <Network3DCanvas style={{ height: '520px' }} />
          </div>
        </div>
      </section>

      <section
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '24px 20px',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Our graduates and alumni work across the industry's most impactful teams
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '36px',
              flexWrap: 'wrap',
              opacity: 0.9,
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-main)',
            }}
          >
            <span>Google</span>
            <span>•</span>
            <span>Microsoft</span>
            <span>•</span>
            <span>Amazon</span>
            <span>•</span>
            <span>Stripe</span>
            <span>•</span>
            <span>Meta</span>
            <span>•</span>
            <span>Apple</span>
            <span>•</span>
            <span>Uber</span>
            <span>•</span>
            <span>Startups & YC</span>
          </div>
        </div>
      </section>

      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 50px' }}>
          <Badge variant="blue" size="md" style={{ marginBottom: '12px' }}>
            Built for Modern Universities
          </Badge>
          <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.025em' }}>
            Engineered to Help Students Succeed
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            No more hunting through cold LinkedIn inboxes. Connectify gives you direct, verified access to alumni who actively want to mentor and hire from their college.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}
        >
          {FEATURE_PILLARS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveTab(f.id)}
              className={`btn ${activeTab === f.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '9999px',
                padding: '10px 22px',
                fontSize: '14px',
                boxShadow: activeTab === f.id ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none',
              }}
            >
              <Icon name={f.icon} size={16} />
              <span>{f.title}</span>
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center',
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            padding: '48px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div>
            <Badge variant="blue" size="md" style={{ marginBottom: '14px' }}>
              {activeFeature.badge}
            </Badge>
            <h3 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 16px', color: 'var(--text-main)' }}>
              {activeFeature.title}
            </h3>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              {activeFeature.desc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {activeFeature.highlights.map((h, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                    }}
                  >
                    <Icon name="check" size={13} color="var(--primary)" />
                  </span>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <Link to="/register" className="btn btn-outline" style={{ gap: '8px' }}>
              <span>Experience {activeFeature.title}</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Card3D
              style={{
                width: '100%',
                maxWidth: '420px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                padding: '28px',
                boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.12)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'var(--primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '18px',
                  }}
                >
                  {activeFeature.cardName[0]}
                </div>
                <Badge variant="green" size="sm">
                  ✓ Verified Alumni
                </Badge>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {activeFeature.cardName}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600, marginBottom: '16px' }}>
                {activeFeature.cardRole}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {activeFeature.cardTags.map((tag, tIdx) => (
                  <span key={tIdx} className="c-badge c-badge-blue c-badge-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'var(--slate-100)',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Icon name="handshake" size={16} color="var(--primary)" />
                <span>Available for 1-on-1 resume reviews & interview guidance</span>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      <section
        id="network"
        style={{
          background: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)',
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
            <Badge variant="cyan" size="md" style={{ marginBottom: '12px' }}>
              Unified Campus Ecosystem
            </Badge>
            <h2 style={{ fontSize: '34px', fontWeight: 800, margin: '0 0 16px' }}>
              Tailored Tools for Every Role
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', margin: 0 }}>
              Whether you are an aspiring student, a working graduate, or a faculty member, Connectify adapts to your goals.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            <Card3D
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--badge-teal-bg)',
                  color: 'var(--badge-teal-text)',
                  border: '1px solid var(--badge-teal-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Icon name="user" size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>For Students</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                Find verified alumni in your dream companies, request tailored mentorship, practice mock interviews, and ask for career advice.
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Discover alumni by graduation year & company</li>
                <li>Send targeted 1-on-1 mentorship requests</li>
                <li>Attend campus career workshops and webinars</li>
              </ul>
            </Card3D>

            <Card3D
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--badge-blue-bg)',
                  color: 'var(--badge-blue-text)',
                  border: '1px solid var(--badge-blue-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Icon name="graduation-cap" size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>For Alumni</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                Give back to your alma mater, mentor promising junior talent, post referral opportunities, and reconnect with fellow batchmates.
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Set flexible mentorship availability</li>
                <li>Share job opportunities and campus referrals</li>
                <li>Stay connected with university developments</li>
              </ul>
            </Card3D>

            <Card3D
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--badge-amber-bg)',
                  color: 'var(--badge-amber-text)',
                  border: '1px solid var(--badge-amber-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Icon name="building" size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>For Faculty & Teachers</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                Host departmental webinars, track student placement success, coordinate guest lectures, and bridge academia with industry.
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Host and manage university-wide events</li>
                <li>Engage alumni for guest sessions</li>
                <li>Monitor department career achievements</li>
              </ul>
            </Card3D>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px' }}>
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #0f172a 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            boxShadow: '0 25px 60px -10px rgba(79, 70, 229, 0.25)',
            padding: '60px 32px',
            textAlign: 'center',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
              filter: 'blur(70px)',
              pointerEvents: 'none',
            }}
          />

          <Badge variant="blue" size="md" style={{ marginBottom: '16px', background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe' }}>
            Official University Platform
          </Badge>

          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, margin: '0 0 18px', color: '#ffffff' }}>
            Ready to Connect with Your Campus Network?
          </h2>

          <p style={{ fontSize: '17px', color: '#cbd5e1', maxWidth: '620px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            Join hundreds of students and alumni building career opportunities together. Create your account in less than 2 minutes.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              className="btn btn-gradient btn-lg"
              style={{ padding: '14px 36px', fontSize: '16px' }}
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              className="btn btn-outline btn-lg"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '14px 28px',
                fontSize: '16px',
              }}
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      <footer
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
          padding: '48px 24px 32px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="navbar-brand-icon">
              <Icon name="users" size={20} color="#ffffff" />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Connect<span style={{ color: 'var(--primary)' }}>ify</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 600 }}>
            <Link to="/register" style={{ color: 'var(--text-muted)' }}>
              Register
            </Link>
            <Link to="/login" style={{ color: 'var(--text-muted)' }}>
              Sign In
            </Link>
            <a href="#features" style={{ color: 'var(--text-muted)' }}>
              Platform
            </a>
            <a href="#network" style={{ color: 'var(--text-muted)' }}>
              Alumni
            </a>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1200px',
            margin: '24px auto 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: 'var(--text-light)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>© {new Date().getFullYear()} Connectify Alumni Network. All rights reserved.</div>
          <div>Official University Alumni, Student & Faculty Portal</div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
