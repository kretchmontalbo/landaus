import { useEffect, useState } from 'react'

/**
 * Returns true if this device should attempt the 3D experience.
 * Checks WebGL support, prefers-reduced-motion, and a low-end-mobile
 * heuristic (CPU cores or device memory). Defaults to false until the
 * client-side check completes (so SSR / first paint never tries to mount
 * a heavy WebGL canvas).
 */
export function use3DSupport() {
  const [should3D, setShould3D] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let webglSupported = false
    try {
      const canvas = document.createElement('canvas')
      webglSupported = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      webglSupported = false
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ua = navigator.userAgent || ''
    const isMobile = /Mobi|Android|iPhone/i.test(ua)
    const cores = navigator.hardwareConcurrency || 8
    const memory = navigator.deviceMemory || 8 // Chrome only; default to "ok" elsewhere
    const lowEndMobile = isMobile && (cores < 4 || memory < 4)

    setShould3D(webglSupported && !reducedMotion && !lowEndMobile)
  }, [])

  return should3D
}

export default use3DSupport
