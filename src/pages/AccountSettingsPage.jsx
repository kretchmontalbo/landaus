import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function AccountSettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || ''
  })

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await updateProfile(form)
    setSaving(false)
    showToast(error ? 'Something went wrong.' : '✓ Profile updated!')
  }

  async function handleDownloadData() {
    setDownloading(true)
    const [profileRes, propsRes, inqsRes, savedRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('properties').select('*, property_images(image_url)').eq('owner_id', user.id),
      supabase.from('inquiries').select('*').or(`tenant_id.eq.${user.id},email.eq.${user.email}`),
      supabase.from('saved_properties').select('*').eq('user_id', user.id)
    ])

    const data = {
      exported_at: new Date().toISOString(),
      profile: profileRes.data,
      properties: propsRes.data || [],
      inquiries: inqsRes.data || [],
      saved_properties: savedRes.data || []
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `landaus-my-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setDownloading(false)
    showToast('✓ Data downloaded!')
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)

    const { data: userProps } = await supabase
      .from('properties')
      .select('id, property_images(image_url)')
      .eq('owner_id', user.id)

    if (userProps?.length > 0) {
      const allPaths = userProps.flatMap(p =>
        (p.property_images || []).map(img => {
          try { return new URL(img.image_url).pathname.split('/property-images/')[1] } catch { return null }
        }).filter(Boolean)
      )
      if (allPaths.length > 0) await supabase.storage.from('property-images').remove(allPaths)
      await supabase.from('properties').delete().eq('owner_id', user.id)
    }

    await supabase.from('saved_properties').delete().eq('user_id', user.id)
    await supabase.from('inquiries').delete().eq('tenant_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await signOut()

    try { await supabase.rpc('delete_user_account') } catch {}

    navigate('/')
  }

  function showToast(text) {
    setToast(text)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <section className="section" style={{ maxWidth: 640 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 32 }}>
        Account Settings
      </h1>

      {/* Section A: Profile */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Profile</h3>
        <form onSubmit={handleSaveProfile}>
          <div className="form-field">
            <label>Full name</label>
            <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Avatar URL</label>
            <input type="url" value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-dark" disabled={saving} style={{ padding: '10px 24px' }}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>

      {/* Section B: Download Data */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Download my data</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.6 }}>
          Under the Australian Privacy Act, you have the right to access all personal data we hold about you. This will download your profile, listings, inquiries, and saved properties as a JSON file.
        </p>
        <button onClick={handleDownloadData} className="btn btn-ghost" disabled={downloading} style={{ padding: '10px 20px' }}>
          {downloading ? 'Preparing…' : 'Download all my data'}
        </button>
      </div>

      {/* Section C: Delete Account */}
      <div style={{ background: 'var(--white)', border: '2px solid #FCA5A5', borderRadius: 'var(--radius-lg)', padding: 28 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#B91C1C' }}>Danger zone</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.6 }}>
          Permanently delete your account, all your listings, photos, inquiries, and saved properties. This action cannot be undone.
        </p>
        <button onClick={() => setDeleteModal(true)} className="btn" style={{ background: '#B91C1C', color: 'white', padding: '10px 20px' }}>
          Delete my account permanently
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius-lg)',
            padding: 32, maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12, color: '#B91C1C' }}>
              Are you sure?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 16 }}>
              This will permanently delete your account, all your listings, photos, inquiries sent, and saved properties. Type <strong>DELETE</strong> to confirm.
            </p>
            <div className="form-field">
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                style={{ textAlign: 'center', fontWeight: 600, letterSpacing: '0.1em' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setDeleteModal(false); setDeleteConfirm('') }} className="btn btn-ghost" disabled={deleting}>
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn"
                disabled={deleteConfirm !== 'DELETE' || deleting}
                style={{ background: deleteConfirm === 'DELETE' ? '#B91C1C' : '#ccc', color: 'white', padding: '10px 20px' }}
              >
                {deleting ? 'Deleting…' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </section>
  )
}
