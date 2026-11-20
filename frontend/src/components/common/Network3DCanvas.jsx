import { useRef, useEffect, useState } from 'react'

export function Network3DCanvas({ className = '', style = {} }) {
  const canvasRef = useRef(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let isVisible = true
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const PERSONAS = [
      { name: 'Sarah Chen', role: 'Alumni', company: 'Google', title: 'Senior SDE', type: 'alumni', color: '#818cf8' },
      { name: 'Alex Rivera', role: 'Student', branch: 'CS 2026', title: 'Fullstack Dev', type: 'student', color: '#38bdf8' },
      { name: 'Dr. Katherine Rao', role: 'Faculty', department: 'Data Science', title: 'Professor', type: 'faculty', color: '#fbbf24' },
      { name: 'David Miller', role: 'Alumni', company: 'Microsoft', title: 'Principal Architect', type: 'alumni', color: '#818cf8' },
      { name: 'Ananya Gupta', role: 'Student', branch: 'AI/ML 2025', title: 'ML Researcher', type: 'student', color: '#38bdf8' },
      { name: 'Marcus Vance', role: 'Alumni', company: 'Amazon', title: 'DevOps Lead', type: 'alumni', color: '#818cf8' },
      { name: 'Elena Rostova', role: 'Alumni', company: 'Stripe', title: 'Staff Engineer', type: 'alumni', color: '#34d399' },
      { name: 'Rahul Joshi', role: 'Student', branch: 'ECE 2024', title: 'IoT Specialist', type: 'student', color: '#38bdf8' },
      { name: 'Sophia Sterling', role: 'Alumni', company: 'Apple', title: 'System Engineer', type: 'alumni', color: '#818cf8' },
      { name: 'Prof. Hemant Roy', role: 'Faculty', department: 'Computer Science', title: 'HOD', type: 'faculty', color: '#fbbf24' },
      { name: 'Kavya Nair', role: 'Alumni', company: 'Netflix', title: 'UI/UX Architect', type: 'alumni', color: '#818cf8' },
      { name: 'Liam O’Connor', role: 'Student', branch: 'IT 2025', title: 'Cloud Enthusiast', type: 'student', color: '#38bdf8' },
      { name: 'Devendra Patel', role: 'Alumni', company: 'Meta', title: 'Tech Lead', type: 'alumni', color: '#818cf8' },
      { name: 'Zoe Zhang', role: 'Student', branch: 'Cybersec 2026', title: 'Security Analyst', type: 'student', color: '#38bdf8' },
      { name: 'Tariq Al-Mansoor', role: 'Alumni', company: 'Uber', title: 'Distributed Systems', type: 'alumni', color: '#34d399' },
    ]

    const NODE_COUNT = 38
    const RADIUS = 230
    const nodes = []

    for (let i = 0; i < NODE_COUNT; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT)
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
      const r = RADIUS * (0.65 + Math.random() * 0.45)

      const persona = PERSONAS[i % PERSONAS.length]

      nodes.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseX: r * Math.sin(phi) * Math.cos(theta),
        baseY: r * Math.sin(phi) * Math.sin(theta),
        baseZ: r * Math.cos(phi),
        radius: persona.type === 'alumni' ? 5.5 : persona.type === 'faculty' ? 6 : 4.5,
        persona,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 1.5 + Math.random() * 2,
        screenX: 0,
        screenY: 0,
        scale: 1,
      })
    }

    const packets = []
    for (let i = 0; i < 14; i++) {
      packets.push({
        sourceIdx: Math.floor(Math.random() * nodes.length),
        targetIdx: Math.floor(Math.random() * nodes.length),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.008,
      })
    }

    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    let angleX = 0.2
    let angleY = 0.3
    let targetAngleX = 0.2
    let targetAngleY = 0.3
    let mouseX = 0
    let mouseY = 0
    let isHoveringCanvas = false

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      isHoveringCanvas = true

      const normX = (mouseX / width - 0.5) * 2
      const normY = (mouseY / height - 0.5) * 2
      targetAngleY = normX * 0.8
      targetAngleX = -normY * 0.6

      let closest = null
      let minDist = 24
      for (const node of nodes) {
        if (node.scale > 0.5) {
          const dx = node.screenX - mouseX
          const dy = node.screenY - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < minDist) {
            minDist = dist
            closest = node
          }
        }
      }

      if (closest) {
        setHoveredNode(closest.persona)
        setTooltipPos({ x: closest.screenX, y: closest.screenY })
      } else {
        setHoveredNode(null)
      }
    }

    const handleMouseLeave = () => {
      isHoveringCanvas = false
      targetAngleX = 0.2
      targetAngleY = 0.3
      setHoveredNode(null)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    observer.observe(canvas)

    let lastTime = performance.now()

    const render = (now) => {
      animationFrameId = requestAnimationFrame(render)
      if (!isVisible) return

      const dt = (now - lastTime) / 1000
      lastTime = now

      if (!reducedMotion) {
        if (!isHoveringCanvas) {
          targetAngleY += dt * 0.15
        }
      }
      angleX += (targetAngleX - angleX) * 0.05
      angleY += (targetAngleY - angleY) * 0.05

      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)

      const focalLength = 480
      const centerX = width / 2
      const centerY = height / 2

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        let x1 = node.baseX * cosY - node.baseZ * sinY
        let z1 = node.baseZ * cosY + node.baseX * sinY

        let y1 = node.baseY * cosX - z1 * sinX
        let z2 = z1 * cosX + node.baseY * sinX

        node.x = x1
        node.y = y1
        node.z = z2

        const perspective = focalLength / (focalLength + z2 + RADIUS)
        node.scale = Math.max(0.2, perspective)
        node.screenX = centerX + x1 * node.scale
        node.screenY = centerY + y1 * node.scale
      }

      const CONNECTION_DIST = 160
      const activeEdges = []

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]

          const dx = a.x - b.x
          const dy = a.y - b.y
          const dz = a.z - b.z
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist3D < CONNECTION_DIST) {
            const alpha = (1 - dist3D / CONNECTION_DIST) * 0.35 * Math.min(a.scale, b.scale)
            activeEdges.push({ a, b, alpha, avgZ: (a.z + b.z) / 2 })
          }
        }
      }

      for (const edge of activeEdges) {
        ctx.beginPath()
        ctx.moveTo(edge.a.screenX, edge.a.screenY)
        ctx.lineTo(edge.b.screenX, edge.b.screenY)
        ctx.strokeStyle = `rgba(99, 102, 241, ${edge.alpha})`
        ctx.lineWidth = Math.max(0.8, edge.a.scale * 1.5)
        ctx.stroke()
      }

      if (!reducedMotion) {
        for (const packet of packets) {
          packet.progress += packet.speed
          if (packet.progress >= 1) {
            packet.progress = 0
            packet.sourceIdx = Math.floor(Math.random() * nodes.length)
            packet.targetIdx = Math.floor(Math.random() * nodes.length)
          }

          const nodeA = nodes[packet.sourceIdx]
          const nodeB = nodes[packet.targetIdx]
          if (nodeA && nodeB) {
            const px = nodeA.screenX + (nodeB.screenX - nodeA.screenX) * packet.progress
            const py = nodeA.screenY + (nodeB.screenY - nodeA.screenY) * packet.progress
            const pScale = (nodeA.scale + nodeB.scale) / 2

            ctx.beginPath()
            ctx.arc(px, py, 2.5 * pScale, 0, Math.PI * 2)
            ctx.fillStyle = '#38bdf8'
            ctx.shadowColor = '#38bdf8'
            ctx.shadowBlur = 8
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      }

      const sortedNodes = [...nodes].sort((a, b) => a.z - b.z)

      for (const node of sortedNodes) {
        const pulse = Math.sin(now * 0.003 * node.pulseSpeed + node.pulseOffset) * 0.25 + 0.75
        const r = node.radius * node.scale * (reducedMotion ? 1 : pulse)

        const glowRadius = r * 3.2
        const glowGrad = ctx.createRadialGradient(
          node.screenX,
          node.screenY,
          r * 0.5,
          node.screenX,
          node.screenY,
          glowRadius
        )
        glowGrad.addColorStop(0, node.persona.color + '99')
        glowGrad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(node.screenX, node.screenY, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(node.screenX, node.screenY, Math.max(2, r), 0, Math.PI * 2)
        ctx.fillStyle = node.persona.color
        ctx.shadowColor = node.persona.color
        ctx.shadowBlur = node.scale * 10
        ctx.fill()
        ctx.shadowBlur = 0

        if (node.persona.type === 'alumni' || node.persona.type === 'faculty') {
          ctx.beginPath()
          ctx.arc(node.screenX, node.screenY, r + 2.5 * node.scale, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * node.scale})`
          ctx.lineWidth = 1 * node.scale
          ctx.stroke()
        }

        if (node.scale > 0.85) {
          ctx.font = `600 ${Math.round(11 * node.scale)}px Plus Jakarta Sans, sans-serif`
          ctx.fillStyle = `rgba(241, 245, 249, ${0.85 * node.scale})`
          ctx.textAlign = 'center'
          ctx.fillText(
            node.persona.company || node.persona.branch || node.persona.name,
            node.screenX,
            node.screenY + r + 14 * node.scale
          )
        }
      }
    }

    render(performance.now())

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
      style={{ minHeight: '440px', position: 'relative', overflow: 'hidden', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: hoveredNode ? 'pointer' : 'grab',
        }}
      />

      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 14}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '12px',
            padding: '8px 14px',
            color: '#ffffff',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(99, 102, 241, 0.3)',
            zIndex: 30,
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: hoveredNode.color,
                boxShadow: `0 0 8px ${hoveredNode.color}`,
              }}
            />
            <strong style={{ fontSize: '13px', fontWeight: 600 }}>{hoveredNode.name}</strong>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
              }}
            >
              {hoveredNode.role}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 500, marginTop: '3px' }}>
            {hoveredNode.title} {hoveredNode.company ? `@ ${hoveredNode.company}` : `• ${hoveredNode.branch || hoveredNode.department}`}
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.5)',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          padding: '4px 10px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
        }}
      >
        ✦ Interactive 3D Network • Hover nodes to explore
      </div>
    </div>
  )
}

export default Network3DCanvas
