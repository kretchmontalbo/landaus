import { useEffect, useRef } from 'react'

export function useParallax(speed = 0.5) {
  const ref = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const element = ref.current
    if (!element) return

    let rafId
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect()
        const windowHeight = window.innerHeight
        if (rect.bottom < 0 || rect.top > windowHeight) return
        const scrolled = window.scrollY
        const offset = scrolled * speed
        element.style.transform = `translate3d(0, ${offset}px, 0)`
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [speed])

  return ref
}

export default useParallax
