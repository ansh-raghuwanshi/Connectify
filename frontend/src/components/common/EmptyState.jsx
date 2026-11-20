import { Icon } from './Icons'

export function EmptyState({
  title = 'No Matching Results Found',
  message = "We couldn't find any profiles matching your criteria. Try searching for another skill, company, graduation year, or reset your filters.",
  onReset = null,
  onSuggestionClick = null,
  suggestions = ['Google', 'Microsoft', 'Computer Science', 'React', 'Available for Mentorship'],
}) {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '56px 28px',
        color: 'var(--text-muted)',
        background: 'var(--bg-card)',
        borderRadius: '24px',
        border: '1px dashed var(--border)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '90px',
          height: '90px',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            animation: 'radarPulse 2.4s infinite cubic-bezier(0.2, 0.8, 0.2, 1)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-22px',
            borderRadius: '50%',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            animation: 'radarPulse 2.4s infinite cubic-bezier(0.2, 0.8, 0.2, 1)',
            animationDelay: '0.8s',
            pointerEvents: 'none',
          }}
        />

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
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
            animation: 'floatSlow 3s infinite ease-in-out',
            zIndex: 2,
          }}
        >
          <Icon name="search" size={28} color="#ffffff" />
        </div>
      </div>

      <h3
        style={{
          margin: '0 0 10px',
          fontSize: '20px',
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: '0 auto 24px',
          fontSize: '14px',
          color: 'var(--text-muted)',
          maxWidth: '460px',
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>

      {suggestions && suggestions.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: onReset ? '20px' : '0',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)', marginRight: '4px' }}>
            Try searching:
          </span>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSuggestionClick && onSuggestionClick(s)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid var(--border)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {onReset && (
        <button
          onClick={onReset}
          className="btn btn-primary btn-sm"
          style={{ gap: '6px', borderRadius: '9999px', padding: '8px 20px' }}
        >
          <Icon name="refresh" size={14} />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  )
}

export default EmptyState
