import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'

/**
 * Gate that only allows admins with an active TOTP factor through.
 * - Unauthenticated → /login
 * - Not an admin   → /
 * - Admin without a verified TOTP factor → /account?admin_2fa_required=true
 * - Admin at aal1 who hasn't completed MFA challenge yet → /login (forces re-auth)
 */
export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState('checking') // 'checking' | 'ok' | 'not_admin' | 'need_2fa' | 'need_challenge' | 'no_user'

  useEffect(() => {
    if (authLoading) return
    if (!user) { setState('no_user'); return }

    let cancelled = false
    async function check() {
      const [{ data: profile }, { data: factors }, { data: aal }] = await Promise.all([
        supabase.from('profiles').select('user_type').eq('id', user.id).single(),
        supabase.auth.mfa.listFactors(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      ])
      if (cancelled) return
      if (profile?.user_type !== 'admin') { setState('not_admin'); return }
      const verifiedTotp = (factors?.totp || []).find(f => f.status === 'verified')
      if (!verifiedTotp) { setState('need_2fa'); return }
      if (aal?.currentLevel !== 'aal2') { setState('need_challenge'); return }
      setState('ok')
    }
    check()
    return () => { cancelled = true }
  }, [authLoading, user])

  if (authLoading || state === 'checking') {
    return <div style={{ padding: 64, textAlign: 'center', color: 'var(--ink-muted)' }}>Loading…</div>
  }
  if (state === 'no_user') return <Navigate to="/login" replace />
  if (state === 'not_admin') return <Navigate to="/" replace />
  if (state === 'need_2fa') return <Navigate to="/account?admin_2fa_required=true" replace />
  if (state === 'need_challenge') return <Navigate to="/login" replace />
  return children
}
