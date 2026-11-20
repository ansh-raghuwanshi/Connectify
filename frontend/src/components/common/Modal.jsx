import { useEffect } from 'react'
import { Icon } from './Icons'

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = '540px' }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 14, 26, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'backdropFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          maxWidth,
          width: '100%',
          padding: '28px',
          border: '1px solid var(--border)',
          color: 'var(--text-main)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            {title && (
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="btn-icon"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s, color 0.15s',
            }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  )
}

export default Modal
