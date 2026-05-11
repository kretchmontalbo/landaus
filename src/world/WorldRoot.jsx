import { useEffect, useState, lazy, Suspense } from 'react'
import { isWorldEnabled, persistFlagFromUrl } from './feature-flag.js'
import { detectEnv, classifyTier } from './tier-probe.js'
import { useWorldStore } from './store.js'

const HUDRoot = lazy(() => import('./HUDRoot.jsx'))

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

  // Note: previously there was a runtime fps probe that auto-downgraded
  // tier. It produced false negatives during the texture-load phase
  // (sub-30 fps for a few frames) and flipped many users to tier 2
  // unnecessarily. The static detection in tier-probe.js (webgl2,
  // reduced-motion, deviceMemory, hardwareConcurrency, connection) is
  // enough to keep low-end devices safe.

  if (!ready) return children
  if (!enabled) return children
  return (
    <Suspense fallback={children}>
      <HUDRoot>{children}</HUDRoot>
    </Suspense>
  )
}
