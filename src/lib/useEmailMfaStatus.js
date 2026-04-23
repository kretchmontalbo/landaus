import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

/**
 * Returns the server-verified email-MFA status for the current session.
 *   null  → still checking
 *   true  → server confirms current session passed email MFA
 *   false → not verified (or no session / query failed)
 *
 * Calls is_session_email_mfa_verified(p_session_token) with the current
 * access token. Server-truth — cannot be bypassed via DevTools storage edits.
 */
export function useEmailMfaStatus() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setStatus(null)
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      if (!token) { if (!cancelled) setStatus(false); return }
      const { data, error } = await supabase.rpc(
        'is_session_email_mfa_verified',
        { p_session_token: token }
      )
      if (cancelled) return
      if (error) { setStatus(false); return }
      setStatus(!!data)
    }
    run()
    const { data: sub } = supabase.auth.onAuthStateChange(() => run())
    return () => { cancelled = true; sub?.subscription?.unsubscribe?.() }
  }, [])

  return status
}
