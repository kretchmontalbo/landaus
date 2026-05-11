const STORAGE_KEY = 'landaus.3d.on'

function urlParam(name) {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(name)
}

export function isWorldEnabled() {
  const url = urlParam('3d')
  if (url === '0') return false
  if (url === '1') return true
  if (typeof window === 'undefined') return false
  return window.localStorage?.getItem(STORAGE_KEY) === '1'
}

export function persistFlagFromUrl() {
  if (typeof window === 'undefined') return
  const url = urlParam('3d')
  if (url === '1') window.localStorage.setItem(STORAGE_KEY, '1')
  if (url === '0') window.localStorage.removeItem(STORAGE_KEY)
}

export function setWorldEnabled(value) {
  if (typeof window === 'undefined') return
  if (value) window.localStorage.setItem(STORAGE_KEY, '1')
  else window.localStorage.removeItem(STORAGE_KEY)
}
