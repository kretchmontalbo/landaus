import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 160px)', display: 'grid', placeItems: 'center', padding: '48px 20px' }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--white)', padding: 40, borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 16px',
            background: 'var(--mint)', borderRadius: 16,
            display: 'grid', placeItems: 'center', fontSize: 28
          }}>🔑</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 30,
            fontWeight: 600, marginBottom: 6, letterSpacing: '-0.02em'
          }}>Reset your password</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div style={{
            background: 'var(--mint-soft)', color: 'var(--accent)',
            padding: 20, borderRadius: 12, fontSize: 14, lineHeight: 1.6, textAlign: 'center'
          }}>
            <strong>Check your email!</strong><br />
            We've sent a password reset link to <strong>{email}</strong>. It may take a minute to arrive.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', color: '#991B1B',
                padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 14
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-dark btn-block" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--ink-soft)' }}>
          Remember your password? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
