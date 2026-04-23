import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import PasswordInput from '../components/PasswordInput.jsx'
import { isValidEmail } from '../lib/validation.js'

const LOCKOUT_KEY = email => `landaus-mfa-lockout-${email.toLowerCase()}`
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000
const RESEND_COOLDOWN_SEC = 60

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
  const [challengeMode, setChallengeMode] = useState('totp') // 'totp' | 'email'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lockoutUntil, setLockoutUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [resendAt, setResendAt] = useState(0)         // timestamp when cooldown clears
  const codeRef = useRef(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const resetSuccess = params.get('reset') === 'success'
  const timedOut = params.get('timeout') === '1'

  // Tick clock for lockout + resend cooldown
  useEffect(() => {
    if (step !== 'locked_out' && resendAt <= Date.now()) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [step, resendAt])

  useEffect(() => {
    if (step === 'mfa_challenge') setTimeout(() => codeRef.current?.focus(), 50)
  }, [step, challengeMode])

  async function onPasswordSubmit(e) {
    e.preventDefault()
    setError(null); setNotice(null)
    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return }

    const lock = readLockout(email)
    if (lock.until && lock.until > Date.now()) {
      setLockoutUntil(lock.until); setStep('locked_out'); return
    }

    setLoading(true)
    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setLoading(false); setError(signInError.message); return
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    setLoading(false)

    if (aal?.currentLevel === 'aal2') { await routeAfterAuth(); return }
    if (aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2') {
      setChallengeMode('totp')
      setStep('mfa_challenge'); return
    }
    await routeAfterAuth()
  }

  async function routeAfterAuth({ fromEmailMfa = false } = {}) {
    try {
      const { data: sess } = await supabase.auth.getSession()
      const uid = sess?.session?.user?.id
      if (uid) {
        const { data: profile } = await supabase
          .from('profiles').select('user_type').eq('id', uid).single()
        if (profile?.user_type === 'admin') {
          if (fromEmailMfa) {
            // Shouldn't be possible (RPC blocks) — defensive: never route an
            // email-MFA session to /admin.
            navigate('/dashboard'); return
          }
          const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
          if (aal?.currentLevel !== 'aal2') {
            navigate('/account?admin_2fa_required=true'); return
          }
          navigate('/admin'); return
        }
      }
    } catch {}
    navigate('/dashboard')
  }

  async function getCurrentProfileType() {
    try {
      const { data: sess } = await supabase.auth.getSession()
      const uid = sess?.session?.user?.id
      if (!uid) return null
      const { data } = await supabase.from('profiles').select('user_type').eq('id', uid).single()
      return data?.user_type || null
    } catch { return null }
  }

  async function requestEmailCode() {
    setError(null); setNotice(null)
    // Admin accounts cannot use email backup
    const userType = await getCurrentProfileType()
    if (userType === 'admin') {
      setNotice('Admin accounts must use an authenticator app. If you\'ve lost access, contact support@landaus.com.au.')
      return
    }

    setLoading(true)
    const { data, error: fnErr } = await supabase.functions.invoke('send-mfa-email', { body: {} })
    setLoading(false)
    if (fnErr || !data?.success) {
      const msg = data?.error || fnErr?.message || 'Could not send code. Please try again.'
      if (/too many|rate/i.test(msg)) {
        setError('Too many code requests. Please try again in an hour.')
      } else {
        setError(msg)
      }
      return
    }
    setChallengeMode('email')
    setCode('')
    setResendAt(Date.now() + RESEND_COOLDOWN_SEC * 1000)
    setNotice('Code sent to your email (check inbox + spam).')
  }

  async function onVerifyCode(e) {
    e.preventDefault()
    setError(null)
    if (code.length < 6) return
    setLoading(true)

    if (challengeMode === 'totp') {
      const { data: factorData, error: listErr } = await supabase.auth.mfa.listFactors()
      if (listErr) { setLoading(false); setError('Could not load 2FA factors. Contact support.'); return }
      const totp = (factorData?.totp || []).find(f => f.status === 'verified')
      if (!totp) { setLoading(false); setError('No 2FA factor found. Contact support.'); return }

      const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id })
      if (chErr) { setLoading(false); setError(chErr.message); return }

      const { error: verErr } = await supabase.auth.mfa.verify({
        factorId: totp.id, challengeId: challenge.id, code
      })
      setLoading(false)

      if (verErr) return handleFailedCode('Invalid code. Please try again.')

      clearLockout(email)
      await routeAfterAuth()
      return
    }

    // challengeMode === 'email'
    const { data: vData, error: vErr } = await supabase.rpc('verify_email_mfa_code', { p_code: code })
    if (vErr || !vData?.success) {
      setLoading(false)
      if (vData?.error === 'too_many_attempts') {
        setError('Too many wrong attempts. Please request a new code.')
      } else if (typeof vData?.attempts_remaining === 'number') {
        setError(`Invalid code. (${vData.attempts_remaining} ${vData.attempts_remaining === 1 ? 'attempt' : 'attempts'} left)`)
      } else {
        setError(vData?.error || vErr?.message || 'Invalid code. Please try again.')
      }
      setCode('')
      setTimeout(() => codeRef.current?.focus(), 30)
      return
    }

    // Mark server-side session marker as email-MFA verified
    const { data: sess } = await supabase.auth.getSession()
    const token = sess?.session?.access_token
    const { data: markData, error: markErr } = await supabase.rpc('mark_session_email_mfa_verified', { p_session_token: token })
    setLoading(false)
    if (markErr || !markData?.success) {
      setError(markErr?.message || markData?.message || 'Could not verify session. Contact support.')
      return
    }
    clearLockout(email)
    await routeAfterAuth({ fromEmailMfa: true })
  }

  async function handleFailedCode(msg) {
    const lock = readLockout(email)
    const count = lock.count + 1
    if (count >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS
      writeLockout(email, count, until)
      try { await supabase.rpc('revoke_email_mfa_session') } catch {}
      await supabase.auth.signOut()
      setLockoutUntil(until); setStep('locked_out')
    } else {
      writeLockout(email, count, 0)
      setError(`${msg} (${MAX_ATTEMPTS - count} ${MAX_ATTEMPTS - count === 1 ? 'attempt' : 'attempts'} left)`)
      setCode('')
      setTimeout(() => codeRef.current?.focus(), 30)
    }
  }

  async function signInAsDifferentUser() {
    try { await supabase.rpc('revoke_email_mfa_session') } catch {}
    await supabase.auth.signOut()
    setStep('password'); setChallengeMode('totp')
    setCode(''); setPassword(''); setError(null); setNotice(null); setResendAt(0)
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
    const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000))
    const cooldown = secondsLeft > 0

    const heading = challengeMode === 'totp'
      ? 'Enter your authentication code'
      : 'Enter the code from your email'
    const subtitle = challengeMode === 'totp'
      ? 'Open your authenticator app and enter the 6-digit code.'
      : 'We sent a 6-digit code to your registered email. Check spam if it\'s not there.'
    const icon = challengeMode === 'totp' ? '🔐' : '📧'

    return (
      <Shell>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 14px',
            background: 'var(--mint)', borderRadius: 16,
            display: 'grid', placeItems: 'center', fontSize: 26
          }}>{icon}</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26,
            fontWeight: 600, marginBottom: 6, letterSpacing: '-0.02em'
          }}>{heading}</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{subtitle}</p>
        </div>

        {notice && (
          <div style={{
            background: 'var(--mint-soft)', color: 'var(--accent)',
            padding: 10, borderRadius: 10, fontSize: 13, marginBottom: 14, textAlign: 'center',
            border: '1px solid var(--mint-deep)'
          }}>{notice}</div>
        )}

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

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          {challengeMode === 'totp' ? (
            <button
              type="button"
              onClick={requestEmailCode}
              disabled={loading}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
            >
              Can't access your authenticator? Email me a code instead →
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={requestEmailCode}
                disabled={loading || cooldown}
                style={{ background: 'transparent', border: 'none', color: cooldown ? 'var(--ink-muted)' : 'var(--accent)', fontWeight: 600, cursor: cooldown ? 'not-allowed' : 'pointer', fontSize: 13 }}
              >
                {cooldown ? `Resend in ${secondsLeft}s` : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={() => { setChallengeMode('totp'); setCode(''); setError(null); setNotice(null) }}
                style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: 13 }}
              >
                ← Use authenticator app instead
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12 }}>
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
