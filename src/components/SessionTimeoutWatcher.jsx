import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'

// 50 minutes warning, 60 minutes auto-logout (idle-based)
const WARN_MS = 50 * 60 * 1000
const KILL_MS = 60 * 60 * 1000

export default function SessionTimeoutWatcher() {
  const { user, signOut } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const lastActivityRef = useRef(Date.now())
  const warnTimerRef = useRef(null)
  const killTimerRef = useRef(null)

  useEffect(() => {
    if (!user) return

    function bump() {
      lastActivityRef.current = Date.now()
      setShowWarning(false)
      schedule()
    }

    function schedule() {
      clearTimeout(warnTimerRef.current)
      clearTimeout(killTimerRef.current)
      warnTimerRef.current = setTimeout(() => setShowWarning(true), WARN_MS)
      killTimerRef.current = setTimeout(async () => {
        await signOut()
        window.location.href = '/login?timeout=1'
      }, KILL_MS)
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, bump, { passive: true }))
    schedule()

    return () => {
      events.forEach(e => window.removeEventListener(e, bump))
      clearTimeout(warnTimerRef.current)
      clearTimeout(killTimerRef.current)
    }
  }, [user, signOut])

  async function refresh() {
    await supabase.auth.refreshSession()
    lastActivityRef.current = Date.now()
    setShowWarning(false)
  }

  if (!user || !showWarning) return null
  return (
    <div
      className="toast"
      role="alert"
      onClick={refresh}
      style={{ cursor: 'pointer' }}
    >
      Your session will expire in 5 minutes — click to stay signed in.
    </div>
  )
}
