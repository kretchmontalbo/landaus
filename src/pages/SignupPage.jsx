import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { isValidEmail } from '../lib/validation.js'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [userType, setUserType] = useState('landlord')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName, userType, {
      terms_agreed_at: new Date().toISOString(),
      terms_version_agreed: '1.0'
    })
    setLoading(false)
    if (error) setError(error.message)
    else {
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 160px)', display: 'grid', placeItems: 'center', padding: '48px 20px' }}>
      <div style={{
        width: '100%', maxWidth: 460,
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
          }}>Join LandAus</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>List your properties or find your next home</p>
        </div>

        {success ? (
          <div style={{
            background: 'var(--mint-soft)', padding: 20, borderRadius: 12,
            textAlign: 'center', border: '1px solid var(--mint-deep)'
          }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: 6 }}>✓ Account created!</h3>
            <p style={{ fontSize: 14 }}>Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label style={{
                  padding: '12px 14px', border: '1px solid',
                  borderColor: userType === 'landlord' ? 'var(--accent)' : 'var(--line)',
                  borderRadius: 10, cursor: 'pointer',
                  background: userType === 'landlord' ? 'var(--mint-pale)' : 'var(--white)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <input type="radio" checked={userType === 'landlord'}
                    onChange={() => setUserType('landlord')} style={{ margin: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>🏠 Landlord</span>
                </label>
                <label style={{
                  padding: '12px 14px', border: '1px solid',
                  borderColor: userType === 'tenant' ? 'var(--accent)' : 'var(--line)',
                  borderRadius: 10, cursor: 'pointer',
                  background: userType === 'tenant' ? 'var(--mint-pale)' : 'var(--white)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <input type="radio" checked={userType === 'tenant'}
                    onChange={() => setUserType('tenant')} style={{ margin: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>🔍 Looking to rent</span>
                </label>
              </div>
            </div>

            <div className="form-field">
              <label>Full name</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Password (min 6 characters)</label>
              <PasswordInput required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Confirm password</label>
              <PasswordInput required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>

            <div style={{ margin: '16px 0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <input type="checkbox" id="agree-terms" required
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }} />
              <label htmlFor="agree-terms" style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, cursor: 'pointer' }}>
                I agree to LandAus's <Link to="/terms" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>Terms of Service</Link> and <Link to="/privacy" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>Privacy Policy</Link>. I understand my personal info will be used to connect me with landlords/tenants on LandAus.
              </label>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', color: '#991B1B',
                padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 14
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-dark btn-block" disabled={loading || !agreedToTerms}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--ink-soft)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
