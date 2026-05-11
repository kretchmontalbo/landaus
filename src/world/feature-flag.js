const STORAGE_KEY = 'landaus.3d.off'

function urlParam(name) {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(name)
}

// 3D world is ON by default. Users opt OUT via:
//   - URL `?3d=0`
//   - Clicking the Classic button (sets localStorage flag)
// They can opt back IN via:
//   - URL `?3d=1`
export function isWorldEnabled() {
  const url = urlParam('3d')
  if (url === '0') return false
  if (url === '1') return true
  if (typeof window === 'undefined') return false
  return window.localStorage?.getItem(STORAGE_KEY) !== '1'
}

// Persist the URL choice to localStorage so it sticks across navigation.
export function persistFlagFromUrl() {
  if (typeof window === 'undefined') return
  const url = urlParam('3d')
  if (url === '0') window.localStorage.setItem(STORAGE_KEY, '1')
  if (url === '1') window.localStorage.removeItem(STORAGE_KEY)
}

// Programmatic toggle (used by the Classic button in the HUD).
export function setWorldEnabled(value) {
  if (typeof window === 'undefined') return
  if (value) window.localStorage.removeItem(STORAGE_KEY)
  else window.localStorage.setItem(STORAGE_KEY, '1')
}
