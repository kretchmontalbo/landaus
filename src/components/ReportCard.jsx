import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const HIGH_SEVERITY = ['scam_fraud', 'illegal_activity', 'harassment', 'safety_concern']

const REASON_LABELS = {
  scam_fraud: 'Scam or fraud',
  discrimination: 'Discrimination',
  fake_listing: 'Fake listing',
  duplicate: 'Duplicate',
  inappropriate_content: 'Inappropriate content',
  misleading_info: 'Misleading info',
  safety_concern: 'Safety concern',
  spam: 'Spam',
  harassment: 'Harassment',
  illegal_activity: 'Illegal activity',
  other: 'Other'
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved_action_taken', label: 'Resolved — Action Taken' },
  { value: 'resolved_no_action', label: 'Resolved — No Action Needed' },
  { value: 'dismissed', label: 'Dismissed' }
]

export default function ReportCard({ report, onSaved }) {
  const { user } = useAuth()
  const [status, setStatus] = useState(report.status || 'new')
  const [notes, setNotes] = useState(report.admin_notes || '')
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [toast, setToast] = useState(null)

  const isHighSev = HIGH_SEVERITY.includes(report.reason)
  const targetLabel = report.target_type === 'property' ? 'Property'
    : report.target_type === 'suburb_guide' ? 'Suburb Guide'
    : report.target_type === 'profile' ? 'Profile'
    : report.target_type
  const targetTitle = report.target?.title || report.target?.suburb || report.target?.full_name || report.target_id

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('reports').update({
      status,
      admin_notes: notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    }).eq('id', report.id)
    setSaving(false)
    if (error) {
      setToast('Error saving')
    } else {
      setToast('✓ Saved')
      if (onSaved) onSaved()
    }
    setTimeout(() => setToast(null), 2000)
  }

  async function handleArchiveProperty() {
    if (!confirm('Archive this property? It will be hidden from the site.')) return
    setArchiving(true)
    await supabase.from('properties').update({ status: 'archived' }).eq('id', report.target_id)
    // also auto-resolve the report
    await supabase.from('reports').update({
      status: 'resolved_action_taken',
      admin_notes: (notes ? notes + '\n\n' : '') + '[Auto] Property archived via quick action.',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    }).eq('id', report.id)
    setArchiving(false)
    if (onSaved) onSaved()
  }

  return (
    <div style={{
      background: 'var(--white)',
      border: `1px solid ${isHighSev ? '#FCA5A5' : 'var(--line)'}`,
      borderLeft: `4px solid ${isHighSev ? '#B91C1C' : '#F59E0B'}`,
      borderRadius: 'var(--radius)',
      padding: 20
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 700,
            background: isHighSev ? '#FEE2E2' : '#FEF3C7',
            color: isHighSev ? '#991B1B' : '#92400E',
            textTransform: 'uppercase', letterSpacing: '0.02em'
          }}>{REASON_LABELS[report.reason] || report.reason}</span>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 600,
            background: report.status === 'new' ? 'var(--accent-hot)' : 'var(--line-soft)',
            color: report.status === 'new' ? 'white' : 'var(--ink-muted)',
            textTransform: 'uppercase'
          }}>{report.status?.replace(/_/g, ' ') || 'new'}</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
          {new Date(report.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div style={{ fontSize: 14, marginBottom: 8 }}>
        <strong>{targetLabel}:</strong>{' '}
        {report.target_url ? (
          <a href={report.target_url} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontWeight: 500 }}>
            {targetTitle}
          </a>
        ) : (
          <span>{targetTitle}</span>
        )}
      </div>

      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12 }}>
        <strong>Reporter:</strong>{' '}
        {report.reporter_id || report.reporter_name || report.reporter_email ? (
          <>
            {report.reporter_name || 'Unnamed'}
            {report.reporter_email && <> · <a href={`mailto:${report.reporter_email}`} style={{ color: 'var(--accent)' }}>{report.reporter_email}</a></>}
          </>
        ) : 'Anonymous'}
      </div>

      {report.details && (
        <div style={{
          background: 'var(--mint-pale)', padding: 12, borderRadius: 8,
          fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 16
        }}>
          {report.details}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--ink-muted)' }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-field" style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Admin notes</label>
        <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Internal notes about this report…" />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={handleSave} className="btn btn-dark" disabled={saving}
          style={{ padding: '8px 18px', fontSize: 13 }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        {report.target_url && (
          <a href={report.target_url} target="_blank" rel="noopener noreferrer"
            className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>
            View target ↗
          </a>
        )}
        {report.target_type === 'property' && (
          <button onClick={handleArchiveProperty} className="btn btn-ghost" disabled={archiving}
            style={{ padding: '8px 18px', fontSize: 13, color: '#B91C1C' }}>
            {archiving ? 'Archiving…' : 'Archive this property'}
          </button>
        )}
      </div>

      {toast && <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--accent)' }}>{toast}</span>}
    </div>
  )
}
