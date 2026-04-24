import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import PasswordInput from '../components/PasswordInput.jsx'
import { isValidEmail } from '../lib/validation.js'
import SignupIllustration from '../components/SignupIllustration.jsx'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [userType, setUserType] = useState('landlord')
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [termsVersion, setTermsVersion] = useState('1.0')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchVersion() {
      try {
        const { data } = await supabase
          .from('terms_versions')
          .select('version')
          .order('effective_date', { ascending: false })
          .limit(1)
          .single()
        if (data?.version) setTermsVersion(data.version)
      } catch {}
    }
    fetchVersion()
  }, [])

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
    if (!termsAgreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)
    const { data: signUpData, error: signUpErr } = await signUp(email, password, fullName, userType, {
      terms_agreed_at: new Date().toISOString(),
      terms_version_agreed: termsVersion,
      marketing_consent: marketingOptIn
    })

    if (signUpErr) {
      setLoading(false)
      setError(signUpErr.message)
      return
    }

    // Record clickwrap consent if we have an authenticated session immediately
    // (email-confirmation OFF). When email-confirmation is ON, the session is
    // null here — we stash the consent intent in localStorage so auth.jsx can
    // fire the RPCs on first sign-in instead.
    const session = signUpData?.session
    if (session) {
      await recordConsents(termsVersion, marketingOptIn)
    } else {
      try {
        localStorage.setItem('landaus-pending-consent', JSON.stringify({
          version: termsVersion,
          marketing: marketingOptIn,
          recorded_at: new Date().toISOString()
        }))
      } catch {}
    }

    setLoading(false)
    setSuccess(true)
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  return (
    <div className="signup-layout">
      <div className="signup-form-col">
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

            {/* Clickwrap consent block */}
            <div className="consent-block">
              <label className="consent-checkbox required">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={e => setTermsAgreed(e.target.checked)}
                  aria-required="true"
                />
                <span>
                  I agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                  {' '}<span className="required-star" aria-label="required">*</span>
                </span>
              </label>

              <label className="consent-checkbox optional">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={e => setMarketingOptIn(e.target.checked)}
                />
                <span>
                  Send me occasional updates about new features and neighbourhoods{' '}
                  <span className="optional-hint">(optional)</span>
                </span>
              </label>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', color: '#991B1B',
                padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 14
              }}>{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-dark btn-block submit-btn"
              disabled={loading || !termsAgreed}
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--ink-soft)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
      </div>
      <div className="signup-visual-col" aria-hidden="true">
        <SignupIllustration />
      </div>
    </div>
  )
}

/**
 * Fire the three (or two) RPCs to record clickwrap consent.
 * Wrapped in try/catch — RPC failures should never block signup UX.
 */
async function recordConsents(version, marketingOptIn) {
  try {
    await supabase.rpc('record_user_consent', { p_consent_type: 'terms', p_version: version })
    await supabase.rpc('record_user_consent', { p_consent_type: 'privacy', p_version: version })
    if (marketingOptIn) {
      await supabase.rpc('record_user_consent', { p_consent_type: 'marketing', p_version: version })
    }
  } catch (err) {
    console.error('Failed to record consent:', err)
  }
}

export { recordConsents }
