import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import PasswordInput from '../components/PasswordInput.jsx'
import { isValidEmail } from '../lib/validation.js'

const LOCKOUT_KEY = email => `landaus-mfa-lockout-${email.toLowerCase()}`
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

function readLockout(email) {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY(email))
    if (!raw) return { count: 0, until: 0 }
    const parsed = JSON.parse(raw)
    return { count: parsed.count || 0, until: parsed.until || 0 }
  } catch { return { count: 0, until: 0 } }
}
function writeLockout(email, count, until) {
  try { localStorage.setItem(LOCKOUT_KEY(email), JSON.stringify({ count, until })) } catch {}
}
function clearLockout(email) {
  try { localStorage.removeItem(LOCKOUT_KEY(email)) } catch {}
}

export default function LoginPage() {
  const [step, setStep] = useState('password') // 'password' | 'mfa_challenge' | 'locked_out'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lockoutUntil, setLockoutUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const codeRef = useRef(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const resetSuccess = params.get('reset') === 'success'
  const timedOut = params.get('timeout') === '1'

  // Countdown tick while locked
  useEffect(() => {
    if (step !== 'locked_out') return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [step])

  // Focus the code input when entering challenge step
  useEffect(() => {
    if (step === 'mfa_challenge') setTimeout(() => codeRef.current?.focus(), 50)
  }, [step])

  async function onPasswordSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return }

    // Check lockout before signing in
    const lock = readLockout(email)
    if (lock.until && lock.until > Date.now()) {
      setLockoutUntil(lock.until); setStep('locked_out'); return
    }

    setLoading(true)
    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setLoading(false)
      setError(signInError.message)
      return
    }

    // Determine MFA state
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    setLoading(false)

    if (aal?.currentLevel === 'aal2') {
      await routeAfterAuth()
      return
    }
    if (aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2') {
      setStep('mfa_challenge')
      return
    }
    // No MFA enrolled → continue as normal
    await routeAfterAuth()
  }

  async function routeAfterAuth() {
    // Admins without MFA must enrol before reaching /admin
    try {
      const { data: sess } = await supabase.auth.getSession()
      const uid = sess?.session?.user?.id
      if (uid) {
        const { data: profile } = await supabase
          .from('profiles').select('user_type').eq('id', uid).single()
        if (profile?.user_type === 'admin') {
          const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
          if (aal?.currentLevel !== 'aal2') {
            navigate('/account?admin_2fa_required=true')
            return
          }
          navigate('/admin')
          return
        }
      }
    } catch {}
    navigate('/dashboard')
  }

  async function onVerifyCode(e) {
    e.preventDefault()
    setError(null)
    if (code.length < 6) return
    setLoading(true)

    // List factors, find verified TOTP
    const { data: factorData, error: listErr } = await supabase.auth.mfa.listFactors()
    if (listErr) { setLoading(false); setError('Could not load 2FA factors. Contact support.'); return }
    const totp = (factorData?.totp || []).find(f => f.status === 'verified')
    if (!totp) { setLoading(false); setError('No 2FA factor found. Contact support.'); return }

    const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id })
    if (chErr) { setLoading(false); setError(chErr.message); return }

    const { error: verErr } = await supabase.auth.mfa.verify({
      factorId: totp.id,
      challengeId: challenge.id,
      code
    })
    setLoading(false)

    if (verErr) {
      const lock = readLockout(email)
      const count = lock.count + 1
      if (count >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS
        writeLockout(email, count, until)
        await supabase.auth.signOut()
        setLockoutUntil(until); setStep('locked_out')
      } else {
        writeLockout(email, count, 0)
        setError(`Invalid code. Please try again. (${MAX_ATTEMPTS - count} ${MAX_ATTEMPTS - count === 1 ? 'attempt' : 'attempts'} left)`)
        setCode('')
        setTimeout(() => codeRef.current?.focus(), 30)
      }
      return
    }

    clearLockout(email)
    await routeAfterAuth()
  }

  async function signInAsDifferentUser() {
    await supabase.auth.signOut()
    setStep('password'); setCode(''); setPassword(''); setError(null)
  }

  // Locked-out view
  if (step === 'locked_out') {
    const msLeft = Math.max(0, lockoutUntil - now)
    const m = Math.floor(msLeft / 60000)
    const s = String(Math.floor((msLeft % 60000) / 1000)).padStart(2, '0')
    return (
      <Shell>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🔒</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
            Too many attempts
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            For your security, 2FA attempts are temporarily blocked.
          </p>
          <div style={{
            background: 'var(--mint-pale)', border: '1px solid var(--mint-deep)',
            padding: 20, borderRadius: 12, marginBottom: 20
          }}>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 4 }}>Try again in</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em' }}>
              {m}:{s}
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
            Lost your device? Email{' '}
            <a href="mailto:support@landaus.com.au" style={{ color: 'var(--accent)', fontWeight: 600 }}>support@landaus.com.au</a>
          </p>
        </div>
      </Shell>
    )
  }

  // MFA challenge view
  if (step === 'mfa_challenge') {
    return (
      <Shell>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 14px',
            background: 'var(--mint)', borderRadius: 16,
            display: 'grid', placeItems: 'center', fontSize: 26
          }}>🔐</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26,
            fontWeight: 600, marginBottom: 6, letterSpacing: '-0.02em'
          }}>Enter your authentication code</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            Open your authenticator app and enter the 6-digit code.
          </p>
        </div>

        <form onSubmit={onVerifyCode}>
          <div className="form-field">
            <label style={{ textAlign: 'center' }}>6-digit code</label>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              autoComplete="one-time-code"
              placeholder="123456"
              style={{
                textAlign: 'center',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 24,
                letterSpacing: '0.3em',
                fontWeight: 600
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', color: '#991B1B',
              padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 14
            }}>{error}</div>
          )}

          <button type="submit" className="btn btn-dark btn-block" disabled={loading || code.length < 6}>
            {loading ? 'Verifying…' : 'Verify →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13 }}>
          <a href="mailto:support@landaus.com.au" style={{ color: 'var(--ink-muted)' }}>
            Lost your device? Contact support
          </a>
        </p>
        <p style={{ textAlign: 'center', marginTop: 6, fontSize: 12 }}>
          <button onClick={signInAsDifferentUser}
            style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: 12 }}>
            Sign in as a different user
          </button>
        </p>
      </Shell>
    )
  }

  // Default: password step
  return (
    <Shell>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, margin: '0 auto 16px',
          background: 'var(--mint)', borderRadius: 16,
          display: 'grid', placeItems: 'center', fontSize: 28
        }}>🏡</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 30,
          fontWeight: 600, marginBottom: 6, letterSpacing: '-0.02em'
        }}>Welcome back</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>Log in to manage your listings</p>
      </div>

      {resetSuccess && (
        <div style={{
          background: 'var(--mint-soft)', color: 'var(--accent)',
          padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 16, textAlign: 'center',
          border: '1px solid var(--mint-deep)'
        }}>
          ✓ Password updated successfully. Please sign in.
        </div>
      )}
      {timedOut && !resetSuccess && (
        <div style={{
          background: '#FEF3C7', color: '#78350F',
          padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 16, textAlign: 'center',
          border: '1px solid #F59E0B'
        }}>
          Signed out for inactivity. Please sign in again.
        </div>
      )}

      <form onSubmit={onPasswordSubmit}>
        <div className="form-field">
          <label>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Password</label>
          <PasswordInput required value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2', color: '#991B1B',
            padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 14
          }}>{error}</div>
        )}

        <button type="submit" className="btn btn-dark btn-block" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 14 }}>
          <Link to="/forgot-password" style={{ color: 'var(--ink-muted)' }}>Forgot password?</Link>
        </p>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--ink-soft)' }}>
        No account? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up free</Link>
      </p>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 160px)', display: 'grid', placeItems: 'center', padding: '48px 20px' }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--white)', padding: 40, borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)'
      }}>
        {children}
      </div>
    </div>
  )
}
