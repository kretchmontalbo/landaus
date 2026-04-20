import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import PasswordInput from './PasswordInput.jsx'

/**
 * Account-settings "Security" section.
 * - Change password (Supabase updateUser)
 * - 2FA (TOTP) enrolment + disable using Supabase MFA API
 */
export default function SecuritySection({ onToast }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24
    }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
        Security
      </h3>
      <ChangePasswordForm onToast={onToast} />
      <div style={{ height: 1, background: 'var(--line)', margin: '24px 0' }} />
      <TwoFactorPanel onToast={onToast} />
    </div>
  )
}

function ChangePasswordForm({ onToast }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (next.length < 8) return setError('New password must be at least 8 characters.')
    if (!/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) return setError('Use a mix of letters and numbers.')
    if (next !== confirm) return setError('New passwords do not match.')

    setSaving(true)
    // Verify current password by re-authenticating
    const { data: session } = await supabase.auth.getSession()
    const email = session?.session?.user?.email
    if (email) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: current })
      if (signInErr) {
        setSaving(false)
        return setError('Current password is incorrect.')
      }
    }
    const { error: updErr } = await supabase.auth.updateUser({ password: next })
    setSaving(false)
    if (updErr) return setError(updErr.message)
    setCurrent(''); setNext(''); setConfirm('')
    onToast && onToast('✓ Password updated')
  }

  return (
    <>
      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Change password</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Current password</label>
          <PasswordInput required value={current} onChange={e => setCurrent(e.target.value)} />
        </div>
        <div className="form-field">
          <label>New password (min 8, letters + numbers)</label>
          <PasswordInput required minLength={8} value={next} onChange={e => setNext(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Confirm new password</label>
          <PasswordInput required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} />
        </div>
        {error && (
          <div style={{ background: '#FEF2F2', color: '#991B1B', padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 12 }}>
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-dark" disabled={saving} style={{ padding: '10px 22px' }}>
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </>
  )
}

function TwoFactorPanel({ onToast }) {
  const [factors, setFactors] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(null) // { id, qr_code, secret, uri }
  const [challengeId, setChallengeId] = useState(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function loadFactors() {
    setLoading(true)
    const { data } = await supabase.auth.mfa.listFactors()
    setFactors(data?.totp || [])
    setLoading(false)
  }
  useEffect(() => { loadFactors() }, [])

  async function startEnroll() {
    setError(null); setBusy(true)
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    setBusy(false)
    if (err) return setError(err.message)
    setEnrolling({
      id: data.id,
      qr_code: data.totp?.qr_code,
      secret: data.totp?.secret,
      uri: data.totp?.uri
    })
  }

  async function verifyEnroll() {
    if (!enrolling?.id) return
    setError(null); setBusy(true)
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enrolling.id })
    if (chErr) { setBusy(false); return setError(chErr.message) }
    const { error: verErr } = await supabase.auth.mfa.verify({
      factorId: enrolling.id,
      challengeId: ch.id,
      code
    })
    setBusy(false)
    if (verErr) return setError(verErr.message)
    setEnrolling(null); setCode(''); setChallengeId(null)
    onToast && onToast("✓ 2FA enabled! You'll be asked for a code on next login.")
    loadFactors()
  }

  async function cancelEnroll() {
    if (enrolling?.id) {
      try { await supabase.auth.mfa.unenroll({ factorId: enrolling.id }) } catch {}
    }
    setEnrolling(null); setCode(''); setError(null)
  }

  async function disableFactor(id) {
    if (!confirm('Disable 2FA? This reduces your account security.')) return
    setBusy(true)
    const { error: err } = await supabase.auth.mfa.unenroll({ factorId: id })
    setBusy(false)
    if (err) return setError(err.message)
    onToast && onToast('2FA disabled')
    loadFactors()
  }

  const verified = factors.filter(f => f.status === 'verified')

  return (
    <>
      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Two-factor authentication</h4>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14, lineHeight: 1.55 }}>
        Add a 6-digit code from an authenticator app (Google Authenticator, Authy, 1Password) on top of your password.
      </p>

      {loading ? (
        <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Loading…</p>
      ) : verified.length > 0 ? (
        <div>
          <div style={{
            background: 'var(--mint-soft)', border: '1px solid var(--mint-deep)',
            padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 14
          }}>
            ✓ 2FA is enabled on this account.
          </div>
          {verified.map(f => (
            <div key={f.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8
            }}>
              <span>TOTP · {f.friendly_name || 'Authenticator app'}</span>
              <button onClick={() => disableFactor(f.id)} disabled={busy}
                className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13, color: '#B91C1C' }}>
                Disable
              </button>
            </div>
          ))}
        </div>
      ) : !enrolling ? (
        <button onClick={startEnroll} disabled={busy} className="btn btn-dark" style={{ padding: '10px 22px' }}>
          {busy ? 'Preparing…' : 'Enable 2FA'}
        </button>
      ) : (
        <div>
          <div style={{
            background: 'var(--mint-pale)', border: '1px solid var(--mint-deep)',
            padding: 18, borderRadius: 10, marginBottom: 12, textAlign: 'center'
          }}>
            {enrolling.qr_code && (
              <img src={enrolling.qr_code} alt="2FA QR code" width={180} height={180}
                style={{ margin: '0 auto 10px', display: 'block', background: '#fff', padding: 8, borderRadius: 8 }} />
            )}
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>
              Scan with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong>.
            </div>
            {enrolling.secret && (
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                Or enter this key manually: <strong>{enrolling.secret}</strong>
              </div>
            )}
          </div>
          <div className="form-field">
            <label>Enter the 6-digit code from your app</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              autoComplete="one-time-code"
              style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: 18 }}
            />
          </div>
          {error && (
            <div style={{ background: '#FEF2F2', color: '#991B1B', padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 12 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={verifyEnroll} disabled={busy || code.length < 6} className="btn btn-dark"
              style={{ padding: '10px 22px' }}>
              {busy ? 'Verifying…' : 'Verify & enable'}
            </button>
            <button onClick={cancelEnroll} disabled={busy} className="btn btn-ghost" style={{ padding: '10px 22px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && !enrolling && (
        <div style={{ background: '#FEF2F2', color: '#991B1B', padding: 10, borderRadius: 10, fontSize: 14, marginTop: 12 }}>
          {error}
        </div>
      )}
    </>
  )
}
