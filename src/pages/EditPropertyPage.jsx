import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function EditPropertyPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', property_type: 'apartment',
    price_per_week: '', bond: '', bedrooms: 1, bathrooms: 1, parking: 0,
    street_address: '', suburb: '', state: 'NSW', postcode: '',
    furnished: false, pets_allowed: false, newcomer_friendly: true,
    no_rental_history_required: false, accepts_visa_holders: true, available_from: ''
  })

  useEffect(() => { loadProperty() }, [id])

  async function loadProperty() {
    const { data } = await supabase
      .from('properties')
      .select('*, property_images(id, image_url)')
      .eq('id', id)
      .single()

    if (!data || data.owner_id !== user?.id) {
      navigate('/dashboard')
      return
    }

    setForm({
      title: data.title || '', description: data.description || '',
      property_type: data.property_type || 'apartment',
      price_per_week: data.price_per_week || '', bond: data.bond || '',
      bedrooms: data.bedrooms || 1, bathrooms: data.bathrooms || 1, parking: data.parking || 0,
      street_address: data.street_address || '', suburb: data.suburb || '',
      state: data.state || 'NSW', postcode: data.postcode || '',
      furnished: data.furnished || false, pets_allowed: data.pets_allowed || false,
      newcomer_friendly: data.newcomer_friendly ?? true,
      no_rental_history_required: data.no_rental_history_required || false,
      accepts_visa_holders: data.accepts_visa_holders ?? true,
      available_from: data.available_from || ''
    })
    setImages((data.property_images || []).map(img => ({ url: img.image_url, id: img.id, existing: true })))
    setLoading(false)
  }

  async function handleImageSelect(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const newImages = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
      const { error } = await supabase.storage.from('property-images').upload(path, file)
      if (!error) {
        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(path)
        newImages.push({ url: urlData.publicUrl, path })
      }
    }
    setImages([...images, ...newImages])
    setUploading(false)
  }

  function removeImage(idx) {
    const img = images[idx]
    if (img.path) supabase.storage.from('property-images').remove([img.path])
    if (img.id) supabase.from('property_images').delete().eq('id', img.id)
    setImages(images.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase
      .from('properties')
      .update({
        title: form.title, description: form.description,
        property_type: form.property_type, price_per_week: parseFloat(form.price_per_week) || null,
        bond: parseFloat(form.bond) || null, bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms), parking: parseInt(form.parking),
        street_address: form.street_address, suburb: form.suburb,
        state: form.state, postcode: form.postcode,
        furnished: form.furnished, pets_allowed: form.pets_allowed,
        newcomer_friendly: form.newcomer_friendly,
        no_rental_history_required: form.no_rental_history_required,
        accepts_visa_holders: form.accepts_visa_holders,
        available_from: form.available_from || null
      })
      .eq('id', id)

    if (error) {
      setToast({ text: 'Something went wrong. Try again.' })
      setSubmitting(false)
      setTimeout(() => setToast(null), 4000)
      return
    }

    const newImages = images.filter(img => !img.existing)
    if (newImages.length > 0) {
      const maxOrder = images.filter(img => img.existing).length
      await supabase.from('property_images').insert(
        newImages.map((img, i) => ({
          property_id: id, image_url: img.url, display_order: maxOrder + i
        }))
      )
    }

    setToast({ text: '✓ Listing updated!' })
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  if (loading) return <div style={{ padding: 64, textAlign: 'center' }}>Loading…</div>

  return (
    <section className="section" style={{ maxWidth: 780 }}>
      <div className="section-head">
        <div>
          <h2 className="section-title">Edit listing</h2>
          <p className="section-sub">Update your property details.</p>
        </div>
      </div>

      <div style={{ background: 'var(--white)', padding: 32, borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Listing title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="form-field">
            <label>Description *</label>
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-field">
              <label>Property type *</label>
              <select value={form.property_type} onChange={e => setForm({ ...form, property_type: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
                <option value="studio">Studio</option>
                <option value="room">Room</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="form-field">
              <label>Price per week ($) *</label>
              <input type="number" required value={form.price_per_week}
                onChange={e => setForm({ ...form, price_per_week: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="form-field">
              <label>Bedrooms</label>
              <input type="number" min="0" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Bathrooms</label>
              <input type="number" min="0" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Parking</label>
              <input type="number" min="0" value={form.parking} onChange={e => setForm({ ...form, parking: e.target.value })} />
            </div>
          </div>

          <div className="form-field">
            <label>Street address</label>
            <input type="text" value={form.street_address} onChange={e => setForm({ ...form, street_address: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
            <div className="form-field">
              <label>Suburb *</label>
              <input type="text" required value={form.suburb} onChange={e => setForm({ ...form, suburb: e.target.value })} />
            </div>
            <div className="form-field">
              <label>State *</label>
              <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                <option>NSW</option><option>VIC</option><option>QLD</option><option>WA</option>
                <option>SA</option><option>TAS</option><option>ACT</option><option>NT</option>
              </select>
            </div>
            <div className="form-field">
              <label>Postcode</label>
              <input type="text" value={form.postcode} onChange={e => setForm({ ...form, postcode: e.target.value })} />
            </div>
          </div>

          <div className="form-field">
            <label>Photos ({images.length})</label>
            <div style={{ border: '2px dashed var(--line)', borderRadius: 12, padding: 20, textAlign: 'center', background: 'var(--mint-pale)' }}>
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} id="image-upload-edit" />
              <label htmlFor="image-upload-edit" style={{
                display: 'inline-block', padding: '10px 20px', background: 'var(--white)',
                border: '1px solid var(--line)', borderRadius: 999, cursor: 'pointer', fontWeight: 600, fontSize: 14
              }}>{uploading ? 'Uploading…' : '📷 Add photos'}</label>
            </div>
            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginTop: 12 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeImage(i)} style={{
                      position: 'absolute', top: 4, right: 4, width: 24, height: 24,
                      background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '50%', fontSize: 12
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Available from</label>
            <input type="date" value={form.available_from} onChange={e => setForm({ ...form, available_from: e.target.value })} />
          </div>

          <div style={{ background: 'var(--mint-pale)', padding: 20, borderRadius: 12, margin: '20px 0' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12 }}>Newcomer-friendly signals</h4>
            {[
              ['newcomer_friendly', 'Welcome newcomers & immigrants'],
              ['no_rental_history_required', 'No Australian rental history required'],
              ['accepts_visa_holders', 'Accept visa holders (student, skilled, PR)'],
              ['furnished', 'Furnished'],
              ['pets_allowed', 'Pets allowed']
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', gap: 10, padding: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="btn btn-dark btn-block" disabled={submitting || uploading}>
            {submitting ? 'Saving…' : 'Save changes →'}
          </button>
        </form>
      </div>

      {toast && <div className="toast">{toast.text}</div>}
    </section>
  )
}
