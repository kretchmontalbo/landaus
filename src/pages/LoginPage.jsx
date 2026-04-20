import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { isValidEmail } from '../lib/validation.js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const resetSuccess = params.get('reset') === 'success'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/dashboard')
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
        <form onSubmit={handleSubmit}>
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
      </div>
    </div>
  )
}
