import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function VerificationCard({ submission, onUpdated }) {
  const { user } = useAuth()
  const [idUrl, setIdUrl] = useState(null)
  const [ownershipUrl, setOwnershipUrl] = useState(null)
  const [notes, setNotes] = useState(submission.admin_notes || '')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    async function sign() {
      const [idRes, ownRes] = await Promise.all([
        submission.id_document_url
          ? supabase.storage.from('verification-docs').createSignedUrl(submission.id_document_url, 3600)
          : { data: null },
        submission.ownership_document_url
          ? supabase.storage.from('verification-docs').createSignedUrl(submission.ownership_document_url, 3600)
          : { data: null }
      ])
      setIdUrl(idRes.data?.signedUrl || null)
      setOwnershipUrl(ownRes.data?.signedUrl || null)
    }
    sign()
  }, [submission.id, submission.id_document_url, submission.ownership_document_url])

  async function updateStatus(newStatus, extra = {}) {
    setBusy(true)
    const payload = {
      status: newStatus,
      admin_notes: notes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      ...extra
    }
    const { error } = await supabase.from('verification_submissions').update(payload).eq('id', submission.id)
    if (!error && newStatus === 'approved') {
      await supabase.from('profiles').update({ verified: true }).eq('id', submission.user_id)
    }
    setBusy(false)
    if (error) {
      setToast('Error: ' + error.message)
    } else {
      setToast('✓ Updated')
      if (onUpdated) onUpdated()
    }
    setTimeout(() => setToast(null), 2500)
  }

  async function approve() { await updateStatus('approved') }
  async function reject() {
    if (!reason.trim()) { setToast('Enter a reason to reject'); setTimeout(() => setToast(null), 2500); return }
    await updateStatus('rejected', { rejection_reason: reason })
  }
  async function askMoreInfo() {
    if (!reason.trim()) { setToast('Enter what info you need'); setTimeout(() => setToast(null), 2500); return }
    await updateStatus('needs_more_info', { info_requested: reason })
  }

  const profile = submission.profile || {}
  const isPendingActionable = submission.status === 'pending' || submission.status === 'under_review' || submission.status === 'needs_more_info'

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)', padding: 20
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <strong style={{ fontSize: 16 }}>{profile.full_name || 'Unnamed user'}</strong>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            <a href={`mailto:${profile.email}`} style={{ color: 'var(--accent)' }}>{profile.email}</a>
            {profile.created_at && <> · Joined {new Date(profile.created_at).toLocaleDateString('en-AU')}</>}
          </div>
        </div>
        <span style={{
          fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 700,
          background: submission.status === 'approved' ? 'var(--mint-soft)'
            : submission.status === 'rejected' ? '#FEE2E2'
            : submission.status === 'needs_more_info' ? '#FEF3C7' : '#DBEAFE',
          color: submission.status === 'approved' ? 'var(--accent)'
            : submission.status === 'rejected' ? '#991B1B'
            : submission.status === 'needs_more_info' ? '#92400E' : '#1E40AF',
          textTransform: 'uppercase'
        }}>{submission.status?.replace(/_/g, ' ') || 'pending'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <DocThumb label={`ID (${submission.id_document_type?.replace(/_/g, ' ') || 'unknown'})`} url={idUrl} />
        <DocThumb label={`Ownership (${submission.ownership_document_type?.replace(/_/g, ' ') || 'unknown'})`} url={ownershipUrl} />
      </div>

      {(submission.abn || submission.real_estate_license_number) && (
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12, padding: 10, background: 'var(--line-soft)', borderRadius: 8 }}>
          {submission.abn && <div><strong>ABN:</strong> {submission.abn}</div>}
          {submission.real_estate_license_number && (
            <div><strong>License:</strong> {submission.real_estate_license_number} ({submission.license_state})</div>
          )}
        </div>
      )}

      {submission.additional_notes && (
        <div style={{ background: 'var(--mint-pale)', padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 12 }}>
          <strong>Submitter notes:</strong> {submission.additional_notes}
        </div>
      )}

      <div className="form-field" style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Admin notes (internal)</label>
        <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {isPendingActionable && (
        <>
          <div className="form-field" style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Reason / request (for reject / ask for more info)</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g. ID is blurry, please re-upload" />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={approve} disabled={busy} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              ✓ Approve
            </button>
            <button onClick={reject} disabled={busy} className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 13, color: '#B91C1C' }}>
              ✗ Reject
            </button>
            <button onClick={askMoreInfo} disabled={busy} className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>
              📧 Ask for more info
            </button>
          </div>
        </>
      )}

      {toast && <div style={{ marginTop: 10, fontSize: 13, color: 'var(--accent)' }}>{toast}</div>}
    </div>
  )
}

function DocThumb({ label, url }) {
  if (!url) return (
    <div style={{
      border: '1px dashed var(--line)', borderRadius: 10, padding: 16,
      textAlign: 'center', fontSize: 12, color: 'var(--ink-muted)'
    }}>
      {label}<br /><em>No document</em>
    </div>
  )
  const isImg = /\.(png|jpe?g|webp|gif)$/i.test(url.split('?')[0])
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: 'block', border: '1px solid var(--line)', borderRadius: 10,
      overflow: 'hidden', textDecoration: 'none'
    }}>
      <div style={{ aspectRatio: '4/3', background: 'var(--line-soft)', display: 'grid', placeItems: 'center' }}>
        {isImg
          ? <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 40 }}>📄</span>}
      </div>
      <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>
        {label} ↗
      </div>
    </a>
  )
}
