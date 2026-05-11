export function classifyTier(env) {
  if (!env.webgl2) return 2
  if (env.reducedMotion) return 2
  if (env.connectionEffectiveType === '2g' || env.connectionEffectiveType === 'slow-2g') return 2
  if (typeof env.deviceMemoryGB === 'number' && env.deviceMemoryGB < 4) return 1
  if (typeof env.hardwareConcurrency === 'number' && env.hardwareConcurrency < 4) return 1
  return 0
}

export function detectEnv() {
  if (typeof window === 'undefined') {
    return { webgl2: false, reducedMotion: false, deviceMemoryGB: null, connectionEffectiveType: null, hardwareConcurrency: null }
  }
  let webgl2 = false
  try {
    const c = document.createElement('canvas')
    webgl2 = !!c.getContext('webgl2')
  } catch (_) {
    webgl2 = false
  }
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const deviceMemoryGB = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null
  const connectionEffectiveType = navigator.connection?.effectiveType ?? null
  const hardwareConcurrency = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null
  return { webgl2, reducedMotion, deviceMemoryGB, connectionEffectiveType, hardwareConcurrency }
}
