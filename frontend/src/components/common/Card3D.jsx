import { useRef, useState, useEffect } from 'react'

export function Card3D({
  children,
  className = '',
  style = {},
  maxTilt = 8,
  glare = true,
  scale = 1.02,
  ...props
}) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const width = rect.width
    const height = rect.height

    const xPct = (x / width - 0.5) * 2
    const yPct = (y / height - 0.5) * 2

    const rotX = -yPct * maxTilt
    const rotY = xPct * maxTilt

    setTransform(`perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`)
    if (glare) {
      setGlarePosition({
        x: Math.round((x / width) * 100),
        y: Math.round((y / height) * 100),
        opacity: 0.15,
      })
    }
  }

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    if (glare) {
      setGlarePosition((prev) => ({ ...prev, opacity: 0 }))
    }
  }

  return (
    <div
      ref={cardRef}
      className={`card-3d-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform,
        transition: 'transform 0.18s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.2s ease',
        willChange: 'transform',
        ...style,
      }}
      {...props}
    >
      {children}

      {glare && !prefersReducedMotion && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent 60%)`,
            transition: 'opacity 0.2s ease',
            mixBlendMode: 'overlay',
            zIndex: 10,
          }}
        />
      )}
    </div>
  )
}

export default Card3D
