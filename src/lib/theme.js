const KEY = 'landaus-theme'

export function getTheme() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  if (typeof document === 'undefined') return
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  try { localStorage.setItem(KEY, theme) } catch {}
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
