import { useEffect, useRef, useState } from 'react'

/**
 * Renders a stat. If `to` is a number, animates from 0 to that number
 * (with optional prefix like "$" or suffix like "%") the first time the
 * element enters the viewport. If `to` is a string (e.g. "✓"), shows as-is.
 * Respects prefers-reduced-motion.
 */
export default function AnimatedStat({ to, prefix = '', suffix = '', duration = 1500 }) {
  const ref = useRef(null)
  const [value, setValue] = useState(typeof to === 'number' ? 0 : to)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (typeof to !== 'number') { setValue(to); return }

    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setValue(to); return }

    if (!ref.current) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          const start = performance.now()
          const tick = now => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
            setValue(Math.round(to * eased))
            if (t < 1) requestAnimationFrame(tick)
            else setValue(to)
          }
          requestAnimationFrame(tick)
        }
      })
    }, { threshold: 0.4 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to, duration, started])

  return (
    <span ref={ref}>
      {typeof to === 'number' ? `${prefix}${value}${suffix}` : value}
    </span>
  )
}
