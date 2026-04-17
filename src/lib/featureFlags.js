import { supabase } from './supabase.js'

let cachedFlags = null
let cacheTime = 0

export async function getFeatureFlag(key) {
  // Cache for 5 minutes
  if (!cachedFlags || Date.now() - cacheTime > 300000) {
    const { data } = await supabase.from('feature_flags').select('key, enabled')
    cachedFlags = Object.fromEntries((data || []).map(f => [f.key, f.enabled]))
    cacheTime = Date.now()
  }
  return cachedFlags[key] ?? false
}

export async function getAllFlags() {
  await getFeatureFlag('_init')  // triggers cache
  return cachedFlags || {}
}

export function clearFlagCache() {
  cachedFlags = null
  cacheTime = 0
}
