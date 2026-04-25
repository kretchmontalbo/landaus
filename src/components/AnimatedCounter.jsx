import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({ end, suffix = '', prefix = '', duration = 1500 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true

          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setCount(end)
            return
          }

          const startTime = performance.now()
          const animate = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            setCount(Math.floor(end * eased))
            if (progress < 1) requestAnimationFrame(animate)
            else setCount(end)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={ref} className="animated-counter">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

export default AnimatedCounter
