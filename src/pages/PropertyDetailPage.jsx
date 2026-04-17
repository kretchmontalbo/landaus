import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '', move_in_date: ''
  })

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('properties')
      .select('*, property_images(image_url, display_order)')
      .eq('id', id)
      .single()
    setProperty(data)
    setLoading(false)
  }

  async function handleInquiry(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('inquiries').insert({
      property_id: id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      move_in_date: form.move_in_date || null
    })
    setSubmitting(false)
    if (error) {
      setToast({ type: 'error', text: 'Something went wrong. Try again.' })
    } else {
      setToast({ type: 'ok', text: `✓ Inquiry sent! The landlord will be in touch.` })
      setForm({ name: '', email: '', phone: '', message: '', move_in_date: '' })
    }
    setTimeout(() => setToast(null), 4000)
  }

  if (loading) {
    return (
      <div className="detail-wrap">
        <div className="skeleton" style={{ aspectRatio: '16/9', marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 20, width: '40%' }} />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="detail-wrap empty-state">
        <h3>Property not found</h3>
        <Link to="/search" className="btn btn-primary" style={{ marginTop: 16 }}>Browse all homes</Link>
      </div>
    )
  }

  const img = property.property_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1600'

  return (
    <div className="detail-wrap">
      <Link to="/search" className="back-link">← Back to results</Link>

      <div className="detail-gallery">
        <img src={img} alt={property.title} />
      </div>

      <div className="detail-grid">
        <div>
          <h1 className="detail-title">{property.title}</h1>
          <p className="detail-address">
            📍 {property.street_address && `${property.street_address}, `}
            {property.suburb}, {property.state} {property.postcode}
          </p>

          <div className="detail-stats">
            <div className="detail-stat">
              <span className="detail-stat-num">${property.price_per_week}</span>
              <span className="detail-stat-lbl">per week</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-num">{property.bedrooms}</span>
              <span className="detail-stat-lbl">bedrooms</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-num">{property.bathrooms}</span>
              <span className="detail-stat-lbl">bathrooms</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-num">{property.parking}</span>
              <span className="detail-stat-lbl">parking</span>
            </div>
            {property.bond && (
              <div className="detail-stat">
                <span className="detail-stat-num">${property.bond}</span>
                <span className="detail-stat-lbl">bond</span>
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>About this property</h3>
            <p>{property.description}</p>
          </div>

          <div className="detail-section">
            <h3>Newcomer-friendly features</h3>
            <div className="signal-list">
              {property.newcomer_friendly && <span className="signal-tag">✨ Newcomer welcome</span>}
              {property.no_rental_history_required && <span className="signal-tag">📄 No rental history needed</span>}
              {property.accepts_visa_holders && <span className="signal-tag">🛂 Visa holders welcome</span>}
              {property.furnished && <span className="signal-tag">🛋 Furnished</span>}
              {property.pets_allowed && <span className="signal-tag">🐾 Pets allowed</span>}
              {property.multilingual_support?.map(lang => (
                <span key={lang} className="signal-tag">🗣 {lang}</span>
              ))}
            </div>
          </div>

          {property.available_from && (
            <div className="detail-section">
              <h3>Availability</h3>
              <p>Available from <strong>{new Date(property.available_from).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
            </div>
          )}
        </div>

        <aside className="inquiry-card">
          <h3>Interested?</h3>
          <p className="sub">Send the landlord a message. No account required.</p>
          <form onSubmit={handleInquiry}>
            <div className="form-field">
              <label>Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Preferred move-in date</label>
              <input
                type="date"
                value={form.move_in_date}
                onChange={e => setForm({ ...form, move_in_date: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Message</label>
              <textarea
                required
                placeholder="Hi! I'm interested in this property..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="btn btn-dark btn-block"
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send inquiry →'}
            </button>
          </form>
        </aside>
      </div>

      {toast && <div className="toast">{toast.text}</div>}
    </div>
  )
}
