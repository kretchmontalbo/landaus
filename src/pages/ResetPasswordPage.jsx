import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import PasswordInput from '../components/PasswordInput.jsx'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/login')
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
          }}>🔒</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 30,
            fontWeight: 600, marginBottom: 6, letterSpacing: '-0.02em'
          }}>Set new password</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>New password</label>
            <PasswordInput required minLength={6} value={password}
              onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Confirm new password</label>
            <PasswordInput required minLength={6} value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} />
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', color: '#991B1B',
              padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 14
            }}>{error}</div>
          )}

          <button type="submit" className="btn btn-dark btn-block" disabled={loading}>
            {loading ? 'Updating…' : 'Update password →'}
          </button>
        </form>
      </div>
    </div>
  )
}
