const KEY = 'landaus-recent-views'
const MAX = 40

function readSet() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return new Set(Array.isArray(raw) ? raw : [])
  } catch {
    return new Set()
  }
}

export function trackView(propertyId) {
  if (!propertyId || typeof window === 'undefined') return
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]')
    const filtered = arr.filter(id => id !== propertyId)
    filtered.unshift(propertyId)
    localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, MAX)))
  } catch {}
}

export function getRecentViewSet() {
  if (typeof window === 'undefined') return new Set()
  return readSet()
}

export function hasBeenViewed(propertyId) {
  return getRecentViewSet().has(propertyId)
}
