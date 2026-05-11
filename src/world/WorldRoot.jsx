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
      const tier = classifyTier(env)
      setTier(tier)
    }
    setReady(true)
  }, [setTier])

  if (!ready) return children
  if (!enabled) return children
  return (
    <Suspense fallback={children}>
      <HUDRoot>{children}</HUDRoot>
    </Suspense>
  )
}
