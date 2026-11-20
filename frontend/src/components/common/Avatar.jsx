const GRADIENTS = [
  'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
  'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
]

function hashString(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function Avatar({
  name = 'User',
  src = null,
  size = 'md',
  online = false,
  className = '',
  style = {},
}) {
  const initials = (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')

  const gradientIdx = hashString(name) % GRADIENTS.length
  const background = GRADIENTS[gradientIdx]

  return (
    <div
      className={`c-avatar c-avatar-${size} ${className}`}
      style={{
        background: src ? 'transparent' : background,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: '50%',
        color: '#ffffff',
        fontWeight: 700,
        userSelect: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <span>{initials}</span>
      )}

      {online && (
        <span
          className="c-avatar-status"
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: size === 'lg' ? '14px' : '10px',
            height: size === 'lg' ? '14px' : '10px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid #ffffff',
            boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
          }}
        />
      )}
    </div>
  )
}

export default Avatar
