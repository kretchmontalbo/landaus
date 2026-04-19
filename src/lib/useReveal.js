import { useEffect, useRef, useState } from 'react'

/**
 * Lightweight scroll-reveal hook. Returns [ref, shown].
 * Attach the ref to the element you want to reveal. Use `shown` to
 * toggle a `.revealed` className.
 *
 * Respects prefers-reduced-motion: returns shown=true immediately.
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = {}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setShown(true); return }
    if (!ref.current) return

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setShown(true)
          obs.disconnect() // one-time
        }
      })
    }, { threshold, rootMargin })

    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold, rootMargin])

  return [ref, shown]
}
