import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function GetVerifiedPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const [idFile, setIdFile] = useState(null)
  const [idType, setIdType] = useState('driver_license')
  const [ownershipFile, setOwnershipFile] = useState(null)
  const [ownershipType, setOwnershipType] = useState('title_deed')
  const [abn, setAbn] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseState, setLicenseState] = useState('NSW')
  const [additionalNotes, setAdditionalNotes] = useState('')

  if (profile?.verified) {
    return (
      <section className="section" style={{ maxWidth: 640, textAlign: 'center' }}>
        <div style={{
          background: 'var(--mint-soft)', padding: 40, borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--mint-deep)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent)', marginBottom: 8 }}>
            You're already verified!
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
            Your listings display the verified badge to tenants. Thanks for building trust on LandAus.
          </p>
        </div>
      </section>
    )
  }

  async function uploadFile(file, prefix) {
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${prefix}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('verification-docs')
      .upload(path, file, { upsert: false })
    if (upErr) throw upErr
    return path
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!idFile) { setError('Please upload an ID document.'); return }
    if (!ownershipFile) { setError('Please upload an ownership or authority document.'); return }

    setSubmitting(true)
    try {
      const idPath = await uploadFile(idFile, 'id')
      const ownershipPath = await uploadFile(ownershipFile, 'ownership')

      const { error: insertErr } = await supabase.from('verification_submissions').insert({
        user_id: user.id,
        id_document_url: idPath,
        id_document_type: idType,
        ownership_document_url: ownershipPath,
        ownership_document_type: ownershipType,
        abn: abn || null,
        real_estate_license_number: licenseNumber || null,
        license_state: licenseNumber ? licenseState : null,
        additional_notes: additionalNotes || null,
        status: 'pending'
      })

      if (insertErr) throw insertErr
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 3000)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section className="section" style={{ maxWidth: 640, textAlign: 'center' }}>
        <div style={{
          background: 'var(--mint-soft)', padding: 40, borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--mint-deep)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent)', marginBottom: 8 }}>
            Submitted!
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>
            We'll review within 24 hours. You'll get an email once approved.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="section" style={{ maxWidth: 780 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 44px)',
          fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8
        }}>
          Get verified. Build trust.
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 17 }}>
          Verification is <strong>FREE</strong> and helps tenants trust your listings. Usually approved within 24 hours.
        </p>
      </div>

      <div style={{
        background: 'var(--mint-soft)', border: '1px solid var(--mint-deep)',
        padding: 24, borderRadius: 'var(--radius-lg)', marginBottom: 32
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--accent)', marginBottom: 12 }}>
          Why verify?
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--ink)', lineHeight: 1.8, fontSize: 15 }}>
          <li>✓ Green checkmark badge on all your listings</li>
          <li>✓ Higher visibility in search results</li>
          <li>✓ Tenants trust verified landlords 3x more</li>
          <li>✓ Required to help protect vulnerable newcomers from scams</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: 'var(--white)', padding: 32, borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)'
      }}>
        {/* Section 1 */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
          1. Identity verification
        </h3>
        <div className="form-field">
          <label>ID type *</label>
          <select value={idType} onChange={e => setIdType(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
            <option value="driver_license">Driver's license</option>
            <option value="passport">Passport</option>
            <option value="medicare">Medicare card</option>
          </select>
        </div>
        <div className="form-field">
          <label>Upload ID document *</label>
          <input type="file" required accept="image/*,application/pdf"
            onChange={e => setIdFile(e.target.files?.[0] || null)} />
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 6 }}>
            Documents are encrypted and only visible to LandAus admins.
          </p>
        </div>

        {/* Section 2 */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginTop: 28, marginBottom: 16 }}>
          2. Property authority
        </h3>
        <div className="form-field">
          <label>Document type *</label>
          <select value={ownershipType} onChange={e => setOwnershipType(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
            <option value="title_deed">Title deed</option>
            <option value="council_rates">Council rates notice</option>
            <option value="property_management_agreement">Property management agreement</option>
          </select>
        </div>
        <div className="form-field">
          <label>Upload ownership/authority document *</label>
          <input type="file" required accept="image/*,application/pdf"
            onChange={e => setOwnershipFile(e.target.files?.[0] || null)} />
        </div>

        {/* Section 3 */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginTop: 28, marginBottom: 4 }}>
          3. Business details <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-muted)' }}>(optional, for agencies)</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-field">
            <label>ABN</label>
            <input type="text" value={abn} onChange={e => setAbn(e.target.value)} placeholder="11 223 344 556" />
          </div>
          <div className="form-field">
            <label>Real estate license #</label>
            <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
          </div>
        </div>
        {licenseNumber && (
          <div className="form-field">
            <label>License state</label>
            <select value={licenseState} onChange={e => setLicenseState(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
              <option>NSW</option><option>VIC</option><option>QLD</option><option>WA</option>
              <option>SA</option><option>TAS</option><option>ACT</option><option>NT</option>
            </select>
          </div>
        )}

        {/* Section 4 */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginTop: 28, marginBottom: 16 }}>
          4. Additional info
        </h3>
        <div className="form-field">
          <label>Anything else we should know?</label>
          <textarea rows={4} value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} />
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#991B1B', padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-dark btn-block" disabled={submitting} style={{ marginTop: 16 }}>
          {submitting ? 'Submitting…' : 'Submit for review →'}
        </button>
      </form>
    </section>
  )
}
