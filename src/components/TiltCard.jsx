import { useRef, useCallback } from 'react'

export function TiltCard({ children, className = '', maxTilt = 8, glare = true, as: Tag = 'div', ...rest }) {
  const cardRef = useRef(null)
  const rafRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current
      if (!card) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -maxTilt
      const rotateY = ((x - centerX) / centerX) * maxTilt

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`

      if (glare) {
        const glareX = (x / rect.width) * 100
        const glareY = (y / rect.height) * 100
        card.style.setProperty('--glare-x', `${glareX}%`)
        card.style.setProperty('--glare-y', `${glareY}%`)
      }
    })
  }, [maxTilt, glare])

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }, [])

  return (
    <Tag
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {glare && <div className="tilt-glare" aria-hidden="true" />}
      <div className="tilt-content">{children}</div>
    </Tag>
  )
}

export default TiltCard
