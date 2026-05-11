import { useEffect, useState, lazy, Suspense } from 'react'
import { isWorldEnabled, persistFlagFromUrl } from './feature-flag.js'
import { detectEnv, classifyTier } from './tier-probe.js'
import { useWorldStore } from './store.js'

const HUDRoot = lazy(() => import('./HUDRoot.jsx'))

function startFpsProbe(durationMs, onDone) {
  let frames = 0
  const start = performance.now()
  let raf = 0
  function tick(t) {
    frames += 1
    if (t - start >= durationMs) {
      const fps = (frames * 1000) / (t - start)
      onDone(fps)
      return
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

export default function WorldRoot({ children }) {
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const setTier = useWorldStore((s) => s.setTier)

  useEffect(() => {
    persistFlagFromUrl()
    const on = isWorldEnabled()
    setEnabled(on)
    if (on) {
      const env = detectEnv()
      const initialTier = classifyTier(env)
      setTier(initialTier)
    }
    setReady(true)
  }, [setTier])

  useEffect(() => {
    if (!enabled) return undefined
    const currentTier = useWorldStore.getState().tier
    if (currentTier === 2) return undefined
    const cancel = startFpsProbe(1000, (fps) => {
      if (fps < 25) setTier(2)
      else if (fps < 45 && currentTier === 0) setTier(1)
    })
    return cancel
  }, [enabled, setTier])

  if (!ready) return children
  if (!enabled) return children
  return (
    <Suspense fallback={children}>
      <HUDRoot>{children}</HUDRoot>
    </Suspense>
  )
}
