import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const OK_MIME = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Upload / remove avatar photo.
 * Writes to Supabase Storage bucket "avatars", path "{user.id}/avatar-{ts}.{ext}",
 * and updates profiles.avatar_url. Cleans up the previous file so we don't
 * accumulate orphans.
 */
export default function AvatarUploader({ onToast, onRemove }) {
  const { user, profile, updateProfile } = useAuth()
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)

  const url = profile?.avatar_url || null
  const initials = (profile?.full_name || user?.email || '')
    .split(/\s+/)
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  function extractPath(publicUrl) {
    if (!publicUrl) return null
    try {
      const u = new URL(publicUrl)
      const marker = '/avatars/'
      const idx = u.pathname.indexOf(marker)
      if (idx === -1) return null
      return u.pathname.slice(idx + marker.length)
    } catch { return null }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''  // allow re-selecting same file

    if (!OK_MIME.includes(file.type)) {
      onToast?.('Image files only (JPEG, PNG, or WebP).')
      return
    }
    if (file.size > MAX_BYTES) {
      onToast?.('File too large (max 2 MB).')
      return
    }

    setUploading(true)
    const ext = file.type === 'image/png' ? 'png'
      : file.type === 'image/webp' ? 'webp'
      : 'jpg'
    const path = `${user.id}/avatar-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) {
      setUploading(false)
      onToast?.(`Upload failed: ${upErr.message}`)
      return
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    const newUrl = pub?.publicUrl
    const oldPath = extractPath(url)

    const { error: updErr } = await updateProfile({ avatar_url: newUrl })
    if (updErr) {
      setUploading(false)
      onToast?.(`Could not save: ${updErr.message}`)
      return
    }

    // Delete old file (best-effort) after new one is saved
    if (oldPath && oldPath !== path) {
      try { await supabase.storage.from('avatars').remove([oldPath]) } catch {}
    }

    setUploading(false)
    onToast?.('Profile photo updated')
  }

  async function handleRemove() {
    setShowConfirmRemove(false)
    setUploading(true)
    const oldPath = extractPath(url)
    if (oldPath) {
      try { await supabase.storage.from('avatars').remove([oldPath]) } catch {}
    }
    const { error: updErr } = await updateProfile({ avatar_url: null })
    setUploading(false)
    if (updErr) {
      onToast?.(`Could not save: ${updErr.message}`)
      return
    }
    onRemove?.()
    onToast?.('Profile photo removed')
  }

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Avatar / placeholder */}
      <div className="avatar-frame" aria-hidden={false}>
        {url ? (
          <img src={url} alt="Your profile photo" className="avatar-img" />
        ) : (
          <div className="avatar-placeholder" aria-label="Profile photo placeholder">
            {initials}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          style={{ display: 'none' }}
          aria-label="Upload profile photo"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn btn-dark"
          disabled={uploading}
          style={{ padding: '10px 20px' }}
          aria-label="Upload profile photo"
        >
          {uploading ? 'Saving…' : url ? 'Change photo' : 'Upload photo'}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => setShowConfirmRemove(true)}
            className="btn btn-ghost"
            disabled={uploading}
            style={{ padding: '10px 20px' }}
          >
            Remove photo
          </button>
        )}
        <p style={{
          width: '100%', margin: '6px 0 0',
          fontSize: 12, fontStyle: 'italic', color: 'var(--ink-muted)',
          lineHeight: 1.5
        }}>
          Photo is optional. Verified landlords show a ✓ badge — that's the trust signal that matters.
        </p>
      </div>

      {showConfirmRemove && (
        <div
          onClick={() => setShowConfirmRemove(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(10,37,64,0.5)',
            display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)',
              padding: 28, maxWidth: 420, width: '100%'
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 12 }}>
              Remove your profile photo?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20, lineHeight: 1.6 }}>
              Your photo will be deleted from our storage and replaced with a placeholder.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirmRemove(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleRemove} className="btn" style={{ background: '#B91C1C', color: 'white', padding: '10px 20px' }}>
                Remove photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
