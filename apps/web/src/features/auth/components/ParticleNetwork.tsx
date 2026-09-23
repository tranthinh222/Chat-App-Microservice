import { useEffect, useRef } from 'react'

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const panel = canvas?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !panel || !context) return

    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      glow: number
      phase: number
    }
    let particles: Particle[] = []
    let frame = 0
    let width = 0
    let height = 0
    const pointer = { x: 0, y: 0, active: false }
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const resize = () => {
      const bounds = panel.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = bounds.width
      height = bounds.height
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      const count = Math.max(
        32,
        Math.min(64, Math.round((width * height) / 11000)),
      )
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -(Math.random() * 0.33 + 0.22),
        radius: Math.random() * 1.5 + 0.8,
        glow: Math.random() * 0.35 + 0.65,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const bounds = panel.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
      pointer.active = true
    }
    const handlePointerLeave = () => {
      pointer.active = false
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)

      particles.forEach((particle) => {
        if (!reducedMotion) {
          if (pointer.active) {
            const dx = pointer.x - particle.x
            const dy = pointer.y - particle.y
            const distance = Math.hypot(dx, dy)
            if (distance < 180 && distance > 1) {
              const pull = (1 - distance / 180) * 0.008
              particle.vx += (dx / distance) * pull
              particle.vy += (dy / distance) * pull
            }
          }

          particle.phase += 0.018
          particle.vx *= 0.998
          particle.vy = Math.max(-0.85, Math.min(-0.2, particle.vy))
          particle.x += particle.vx
          particle.y += particle.vy
          if (particle.x < -8) particle.x = width + 8
          if (particle.x > width + 8) particle.x = -8
          if (particle.y < -12) {
            particle.y = height + 12
            particle.x = Math.random() * width
            particle.vy = -(Math.random() * 0.33 + 0.22)
          }
        }

        const twinkle = particle.glow + Math.sin(particle.phase) * 0.18
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(220, 228, 255, ${Math.min(1, twinkle)})`
        context.shadowColor = '#9db0ff'
        context.shadowBlur = particle.radius > 1.5 ? 18 : 11
        context.fill()
      })

      context.shadowBlur = 0
      for (let first = 0; first < particles.length; first += 1) {
        for (let second = first + 1; second < particles.length; second += 1) {
          const a = particles[first]
          const b = particles[second]
          const distance = Math.hypot(a.x - b.x, a.y - b.y)
          if (distance < 115) {
            context.beginPath()
            context.moveTo(a.x, a.y)
            context.lineTo(b.x, b.y)
            context.strokeStyle = `rgba(125, 148, 242, ${(1 - distance / 115) * 0.34})`
            context.lineWidth = 0.8
            context.stroke()
          }
        }
      }

      if (pointer.active) {
        particles.forEach((particle) => {
          const distance = Math.hypot(
            pointer.x - particle.x,
            pointer.y - particle.y,
          )
          if (distance < 145) {
            context.beginPath()
            context.moveTo(pointer.x, pointer.y)
            context.lineTo(particle.x, particle.y)
            context.strokeStyle = `rgba(173, 190, 255, ${(1 - distance / 145) * 0.58})`
            context.lineWidth = 1
            context.stroke()
          }
        })
      }

      frame = requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(panel)
    panel.addEventListener('pointermove', handlePointerMove)
    panel.addEventListener('pointerleave', handlePointerLeave)
    resize()
    draw()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      panel.removeEventListener('pointermove', handlePointerMove)
      panel.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="particle-network" aria-hidden="true" />
  )
}
