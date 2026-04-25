import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { Home, Heart, UserRound, Accessibility, Sparkles } from 'lucide-react'
import {
  ROOM_TYPES, HOUSEHOLD_GENDER, SMOKING_OPTIONS, DRINKING_OPTIONS,
  DIETARY_OPTIONS, RELIGION_OPTIONS, LANGUAGE_OPTIONS, ACCEPT_TOGGLES,
  INCLUSIVITY_TOGGLES, isRoomish
} from '../lib/householdOptions.js'

const INCL_ICONS = {
  lgbtqia: Heart,
  women: UserRound,
  accessible: Accessibility
}

export default function ListPropertyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState([])  // {file, preview, url}
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    price_per_week: '',
    bond: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: 0,
    street_address: '',
    suburb: '',
    state: 'NSW',
    postcode: '',
    furnished: false,
    pets_allowed: false,
    newcomer_friendly: true,
    no_rental_history_required: false,
    accepts_visa_holders: true,
    available_from: '',
    // Household & flatmate
    room_type: '',
    bills_included: false,
    bills_estimated_weekly: '',
    minimum_stay_months: 3,
    maximum_stay_months: '',
    household_size: '',
    household_gender: '',
    household_description: '',
    languages_spoken_in_household: [],
    accepts_students: true,
    accepts_professionals: true,
    accepts_backpackers: false,
    accepts_couples: true,
    accepts_families_with_children: false,
    accepts_pets: false,
    lgbtqia_friendly: false,
    women_safe_space: false,
    disability_accessible: false,
    smoking_location: '',
    drinking_culture: '',
    dietary_preferences: [],
    religious_observance: []
  })

  function toggleArray(key, value) {
    setForm(prev => {
      const arr = Array.isArray(prev[key]) ? prev[key] : []
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      }
    })
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
    supabase.storage.from('property-images').remove([img.path])
    setImages(images.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        owner_id: user.id,
        title: form.title,
        description: form.description,
        property_type: form.property_type,
        listing_type: 'rent',
        price_per_week: parseFloat(form.price_per_week) || null,
        bond: parseFloat(form.bond) || null,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        parking: parseInt(form.parking),
        street_address: form.street_address,
        suburb: form.suburb,
        state: form.state,
        postcode: form.postcode,
        furnished: form.furnished,
        pets_allowed: form.pets_allowed,
        newcomer_friendly: form.newcomer_friendly,
        no_rental_history_required: form.no_rental_history_required,
        accepts_visa_holders: form.accepts_visa_holders,
        available_from: form.available_from || null,
        status: 'active',
        // Household & flatmate fields — only written when they have a value
        ...(form.room_type && { room_type: form.room_type }),
        ...(form.bills_included !== undefined && { bills_included: !!form.bills_included }),
        ...(form.bills_estimated_weekly && { bills_estimated_weekly: parseFloat(form.bills_estimated_weekly) || null }),
        ...(form.minimum_stay_months && { minimum_stay_months: parseInt(form.minimum_stay_months) || null }),
        ...(form.maximum_stay_months && { maximum_stay_months: parseInt(form.maximum_stay_months) || null }),
        ...(form.household_size && { household_size: parseInt(form.household_size) || null }),
        ...(form.household_gender && { household_gender: form.household_gender }),
        ...(form.household_description && { household_description: form.household_description }),
        ...(form.languages_spoken_in_household?.length && { languages_spoken_in_household: form.languages_spoken_in_household }),
        accepts_students: form.accepts_students,
        accepts_professionals: form.accepts_professionals,
        accepts_backpackers: form.accepts_backpackers,
        accepts_couples: form.accepts_couples,
        accepts_families_with_children: form.accepts_families_with_children,
        accepts_pets: form.accepts_pets,
        lgbtqia_friendly: form.lgbtqia_friendly,
        women_safe_space: form.women_safe_space,
        disability_accessible: form.disability_accessible,
        ...(form.smoking_location && { smoking_location: form.smoking_location }),
        ...(form.drinking_culture && { drinking_culture: form.drinking_culture }),
        ...(form.dietary_preferences?.length && { dietary_preferences: form.dietary_preferences }),
        ...(form.religious_observance?.length && { religious_observance: form.religious_observance })
      })
      .select()
      .single()

    if (error || !property) {
      setToast({ text: 'Something went wrong. Try again.' })
      setSubmitting(false)
      setTimeout(() => setToast(null), 4000)
      return
    }

    // Save images
    if (images.length > 0) {
      await supabase.from('property_images').insert(
        images.map((img, i) => ({
          property_id: property.id,
          image_url: img.url,
          display_order: i
        }))
      )
    }

    const msg = property.status === 'pending_review'
      ? '✓ Listing submitted! First-time listings are reviewed within 24 hours. Future listings go live instantly.'
      : '✓ Listing published! Redirecting to your dashboard…'
    setToast({ text: msg })
    setTimeout(() => navigate('/dashboard'), 2500)
  }

  return (
    <section className="section" style={{ maxWidth: 780 }}>
      <div className="section-head">
        <div>
          <h2 className="section-title">List your property</h2>
          <p className="section-sub">Free to list. Welcome newcomers, fill vacancies faster.</p>
        </div>
      </div>

      <div style={{ background: 'var(--white)', padding: 32, borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Listing title *</label>
            <input type="text" required placeholder="e.g. Modern 2BR Apartment with City Views"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="form-field">
            <label>Description *</label>
            <textarea required placeholder="Tell tenants about the property..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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
              <input type="number" min="0" value={form.bedrooms}
                onChange={e => setForm({ ...form, bedrooms: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Bathrooms</label>
              <input type="number" min="0" value={form.bathrooms}
                onChange={e => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Parking</label>
              <input type="number" min="0" value={form.parking}
                onChange={e => setForm({ ...form, parking: e.target.value })} />
            </div>
          </div>

          <div className="form-field">
            <label>Street address</label>
            <input type="text" value={form.street_address}
              onChange={e => setForm({ ...form, street_address: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
            <div className="form-field">
              <label>Suburb *</label>
              <input type="text" required value={form.suburb}
                onChange={e => setForm({ ...form, suburb: e.target.value })} />
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
              <input type="text" value={form.postcode}
                onChange={e => setForm({ ...form, postcode: e.target.value })} />
            </div>
          </div>

          {/* Image upload */}
          <div className="form-field">
            <label>Photos ({images.length})</label>
            <div style={{
              border: '2px dashed var(--line)', borderRadius: 12, padding: 20,
              textAlign: 'center', background: 'var(--mint-pale)'
            }}>
              <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                style={{ display: 'none' }} id="image-upload" />
              <label htmlFor="image-upload" style={{
                display: 'inline-block', padding: '10px 20px',
                background: 'var(--white)', border: '1px solid var(--line)',
                borderRadius: 999, cursor: 'pointer', fontWeight: 600, fontSize: 14
              }}>
                {uploading ? 'Uploading…' : '📷 Add photos'}
              </label>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 8 }}>
                JPG, PNG or WebP. Max 5MB each.
              </p>
            </div>
            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginTop: 12 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeImage(i)} style={{
                      position: 'absolute', top: 4, right: 4, width: 24, height: 24,
                      background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '50%',
                      fontSize: 12, cursor: 'pointer', border: 'none'
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Available from</label>
            <input type="date" value={form.available_from}
              onChange={e => setForm({ ...form, available_from: e.target.value })} />
          </div>

          <div style={{ background: 'var(--mint-pale)', padding: 20, borderRadius: 12, margin: '20px 0' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="icon-inline"><Sparkles size={18} strokeWidth={1.7} /></span>
              Newcomer-friendly signals
            </h4>
            {[
              ['newcomer_friendly', 'Welcome newcomers & immigrants'],
              ['no_rental_history_required', 'No Australian rental history required'],
              ['accepts_visa_holders', 'Accept visa holders (student, skilled, PR)'],
              ['furnished', 'Furnished'],
              ['pets_allowed', 'Pets allowed']
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', gap: 10, padding: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {/* Household & Flatmate Preferences */}
          {isRoomish(form.property_type) && (
            <div style={{
              background: 'var(--white)', border: '1px solid var(--mint-deep)',
              padding: 24, borderRadius: 12, margin: '24px 0'
            }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="icon-inline"><Home size={20} strokeWidth={1.7} /></span>
                Household & Flatmate Preferences
              </h4>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20 }}>
                All fields optional. The more you share, the better we can match the right flatmates.
              </p>

              {/* Room details */}
              <h5 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--ink)' }}>Room details</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-field">
                  <label>Room type</label>
                  <select value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                    <option value="">Select…</option>
                    {ROOM_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Minimum stay (months)</label>
                  <input type="number" min="1" value={form.minimum_stay_months}
                    onChange={e => setForm({ ...form, minimum_stay_months: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Maximum stay (months) — optional</label>
                  <input type="number" min="1" value={form.maximum_stay_months}
                    onChange={e => setForm({ ...form, maximum_stay_months: e.target.value })} />
                </div>
                <div className="form-field" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={form.bills_included}
                      onChange={e => setForm({ ...form, bills_included: e.target.checked })} />
                    Bills included
                  </label>
                  {form.bills_included && (
                    <input type="number" placeholder="Est. $/week" value={form.bills_estimated_weekly}
                      onChange={e => setForm({ ...form, bills_estimated_weekly: e.target.value })}
                      style={{ marginTop: 8, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)' }} />
                  )}
                </div>
              </div>

              {/* Household */}
              <h5 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 10 }}>Your household</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-field">
                  <label>Household size (people already living there)</label>
                  <input type="number" min="0" value={form.household_size}
                    onChange={e => setForm({ ...form, household_size: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Household gender mix</label>
                  <select value={form.household_gender} onChange={e => setForm({ ...form, household_gender: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                    <option value="">Prefer not to say</option>
                    {HOUSEHOLD_GENDER.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Short description (optional, 500 chars)</label>
                <textarea maxLength={500} rows={3} value={form.household_description}
                  onChange={e => setForm({ ...form, household_description: e.target.value })}
                  placeholder="e.g. Two Filipina students, quiet and tidy, work-from-home during weekdays." />
              </div>

              <div className="form-field">
                <label>Languages spoken in household</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {LANGUAGE_OPTIONS.map(l => {
                    const on = form.languages_spoken_in_household.includes(l.value)
                    return (
                      <button
                        type="button" key={l.value}
                        onClick={() => toggleArray('languages_spoken_in_household', l.value)}
                        style={{
                          padding: '6px 12px', borderRadius: 999,
                          border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                          background: on ? 'var(--mint-soft)' : 'var(--white)',
                          color: on ? 'var(--accent)' : 'var(--ink-soft)',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer'
                        }}
                      >{l.label}</button>
                    )
                  })}
                </div>
              </div>

              {/* Accepting */}
              <h5 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 10 }}>Accepting applications from</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
                {ACCEPT_TOGGLES.map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6 }}>
                    <input type="checkbox" checked={!!form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {/* Inclusivity */}
              <h5 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 4 }}>Inclusivity & safe space</h5>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--ink-muted)', marginBottom: 10 }}>
                Only tick if this genuinely applies — misrepresentation isn't fair to applicants.
              </p>
              <div style={{ display: 'grid', gap: 4 }}>
                {INCLUSIVITY_TOGGLES.map(({ key, iconKey, label }) => {
                  const Icon = INCL_ICONS[iconKey]
                  return (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6 }}>
                      <input type="checkbox" checked={!!form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {Icon && <span className="icon-inline"><Icon size={16} strokeWidth={1.7} /></span>}
                        {label}
                      </span>
                    </label>
                  )
                })}
              </div>

              {/* Lifestyle */}
              <h5 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 10 }}>Household lifestyle</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-field">
                  <label>Smoking policy</label>
                  <select value={form.smoking_location} onChange={e => setForm({ ...form, smoking_location: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                    <option value="">Not specified</option>
                    {SMOKING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Drinking culture</label>
                  <select value={form.drinking_culture} onChange={e => setForm({ ...form, drinking_culture: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                    <option value="">Not specified</option>
                    {DRINKING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Dietary household (optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {DIETARY_OPTIONS.map(o => {
                    const on = form.dietary_preferences.includes(o.value)
                    return (
                      <button type="button" key={o.value}
                        onClick={() => toggleArray('dietary_preferences', o.value)}
                        style={{
                          padding: '6px 12px', borderRadius: 999,
                          border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                          background: on ? 'var(--mint-soft)' : 'var(--white)',
                          color: on ? 'var(--accent)' : 'var(--ink-soft)',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer'
                        }}
                      >{o.label}</button>
                    )
                  })}
                </div>
              </div>

              <div className="form-field">
                <label>Religious/cultural observance (optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {RELIGION_OPTIONS.map(o => {
                    const on = form.religious_observance.includes(o.value)
                    return (
                      <button type="button" key={o.value}
                        onClick={() => toggleArray('religious_observance', o.value)}
                        style={{
                          padding: '6px 12px', borderRadius: 999,
                          border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                          background: on ? 'var(--mint-soft)' : 'var(--white)',
                          color: on ? 'var(--accent)' : 'var(--ink-soft)',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer'
                        }}
                      >{o.label}</button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-dark btn-block" disabled={submitting || uploading}>
            {submitting ? 'Publishing…' : 'Publish listing →'}
          </button>
        </form>
      </div>

      {toast && <div className="toast">{toast.text}</div>}
    </section>
  )
}
