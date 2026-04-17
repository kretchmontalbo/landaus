import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const REASONS = [
  { value: 'scam_fraud', label: 'Scam or fraud' },
  { value: 'discrimination', label: 'Discriminatory language or behavior' },
  { value: 'fake_listing', label: 'Fake or non-existent listing' },
  { value: 'duplicate', label: 'Duplicate of another listing' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'misleading_info', label: 'Misleading information' },
  { value: 'safety_concern', label: 'Safety concern' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'illegal_activity', label: 'Illegal activity' },
  { value: 'other', label: 'Other' }
]

const HEADINGS = {
  property: 'Report this listing',
  profile: 'Report this user',
  suburb_guide: 'Report this guide'
}

export default function ReportModal({ targetType, targetId, onClose }) {
  const { user, profile } = useAuth()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [name, setName] = useState(profile?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (reason === 'other' && !details.trim()) {
      setError('Please provide details when selecting "Other".')
      return
    }

    setSubmitting(true)
    const { error: insertError } = await supabase.from('reports').insert({
      target_type: targetType,
      target_id: targetId,
      target_url: typeof window !== 'undefined' ? window.location.href : null,
      reason,
      details: details || null,
      reporter_id: user?.id || null,
      reporter_email: email || null,
      reporter_name: name || null
    })
    setSubmitting(false)

    if (insertError) {
      setError('Something went wrong. Please try again.')
    } else {
      setSuccess(true)
      setTimeout(() => onClose(), 3000)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        padding: 32, maxWidth: 520, width: '100%', boxShadow: 'var(--shadow-lg)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Report submitted</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              Thanks for reporting. Our team will review this within 24 hours. You're helping keep LandAus safe.
            </p>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              {HEADINGS[targetType] || 'Report'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
              Help us keep LandAus safe. We review every report within 24 hours.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Reason *</label>
                <select required value={reason} onChange={e => setReason(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                  <option value="">Select a reason…</option>
                  {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label>Details {reason === 'other' && '*'}</label>
                <textarea
                  required={reason === 'other'}
                  rows={4}
                  placeholder="Please provide details to help us investigate..."
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                />
              </div>

              {!user && (
                <>
                  <div className="form-field">
                    <label>Name (optional)</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label>Email (optional)</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="We may contact you for more info" />
                  </div>
                </>
              )}

              {error && (
                <div style={{
                  background: '#FEF2F2', color: '#991B1B',
                  padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 14
                }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={onClose} className="btn btn-ghost" disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-dark" disabled={submitting || !reason}
                  style={{ padding: '10px 20px' }}>
                  {submitting ? 'Submitting…' : 'Submit report'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
