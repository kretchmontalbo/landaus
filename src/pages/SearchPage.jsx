import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import PropertyCard from '../components/PropertyCard.jsx'
import AdSlot from '../components/AdSlot.jsx'
import ModeTabs from '../components/ModeTabs.jsx'
import { getActiveFeaturedIds, applyFeaturedMerge } from '../lib/featured.js'
import { ROOM_TYPES, LANGUAGE_OPTIONS, DIETARY_OPTIONS } from '../lib/householdOptions.js'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  const suburb = searchParams.get('suburb') || ''
  const state = searchParams.get('state') || ''
  const listingMode = searchParams.get('type') || 'rent'  // rent | buy | flatmates
  const propertyType = searchParams.get('ptype') || ''   // apartment | house | ...
  const maxPrice = searchParams.get('maxPrice') || ''
  const minBeds = searchParams.get('beds') || ''

  // Flatmate-only filters
  const fmRoomType = searchParams.get('room') || ''
  const fmMinStay = searchParams.get('stay') || ''
  const fmBillsIncluded = searchParams.get('bills') === '1'
  const fmLgbt = searchParams.get('lgbt') === '1'
  const fmWomen = searchParams.get('women') === '1'
  const fmCouples = searchParams.get('couples') === '1'
  const fmPets = searchParams.get('pets') === '1'
  const fmLang = searchParams.get('lang') || ''  // comma-separated
  const fmDiet = searchParams.get('diet') || ''  // comma-separated
  const isFlatmates = listingMode === 'flatmates'

  useEffect(() => {
    loadProperties()
  }, [searchParams])

  async function loadProperties() {
    setLoading(true)
    let query = supabase
      .from('properties')
      .select('*, property_images(image_url, display_order), profiles(verified)')
      .eq('status', 'active')

    if (suburb) query = query.ilike('suburb', `%${suburb}%`)
    if (state) query = query.eq('state', state)
    if (propertyType) query = query.eq('property_type', propertyType)
    if (maxPrice) query = query.lte('price_per_week', parseInt(maxPrice))
    if (minBeds) query = query.gte('bedrooms', parseInt(minBeds))

    // Listing-mode filtering (rent / buy / flatmates)
    if (listingMode === 'buy') {
      query = query.eq('listing_type', 'buy')
    } else if (listingMode === 'flatmates') {
      query = query.eq('listing_type', 'rent').in('property_type', ['room', 'studio'])
    } else {
      query = query.eq('listing_type', 'rent')
    }

    // Flatmate-only filters
    if (isFlatmates) {
      if (fmRoomType) query = query.eq('room_type', fmRoomType)
      if (fmMinStay) query = query.gte('minimum_stay_months', parseInt(fmMinStay, 10))
      if (fmBillsIncluded) query = query.eq('bills_included', true)
      if (fmLgbt) query = query.eq('lgbtqia_friendly', true)
      if (fmWomen) query = query.eq('women_safe_space', true)
      if (fmCouples) query = query.eq('accepts_couples', true)
      if (fmPets) query = query.eq('accepts_pets', true)
      if (fmLang) {
        const langs = fmLang.split(',').filter(Boolean)
        if (langs.length) query = query.overlaps('languages_spoken_in_household', langs)
      }
      if (fmDiet) {
        const diets = fmDiet.split(',').filter(Boolean)
        if (diets.length) query = query.overlaps('dietary_preferences', diets)
      }
    }

    query = query.order('is_featured', { ascending: false, nullsFirst: false })
                 .order('created_at', { ascending: false })

    const [{ data }, featuredIds] = await Promise.all([
      query,
      getActiveFeaturedIds()
    ])
    const merged = applyFeaturedMerge(data || [], featuredIds)
    setProperties(merged)
    setLoading(false)
  }

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  // Split cards with an inline ad every 8 cards
  const cells = []
  properties.forEach((p, i) => {
    cells.push(<PropertyCard key={p.id} property={p} />)
    if ((i + 1) % 8 === 0 && i !== properties.length - 1) {
      cells.push(
        <div key={`ad-${i}`} style={{ gridColumn: '1 / -1' }}>
          <AdSlot layout="horizontal" />
        </div>
      )
    }
  })

  // Dynamic heading
  const count = properties.length
  const noun = count === 1 ? 'home' : 'homes'
  const qty = loading ? 'Loading' : count
  let heading
  if (suburb && state) heading = `${qty} ${noun} in ${suburb}, ${state}`
  else if (suburb) heading = `${qty} ${noun} in ${suburb}`
  else if (state) heading = `${qty} ${noun} in ${state}`
  else heading = loading ? 'Loading homes…' : `${count} ${noun} across Australia`

  return (
    <section className="section">
      <div style={{ marginBottom: 20 }}>
        <ModeTabs activeTab={listingMode} />
      </div>
      <div className="section-head">
        <div>
          <h2 className="section-title">{heading}</h2>
          <p className="section-sub">
            Every listing is newcomer-friendly. No rental history barriers.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Suburb"
          defaultValue={suburb}
          onChange={(e) => updateParam('suburb', e.target.value)}
        />
        <select value={state} onChange={(e) => updateParam('state', e.target.value)}>
          <option value="">Any state</option>
          <option value="NSW">NSW</option>
          <option value="VIC">VIC</option>
          <option value="QLD">QLD</option>
          <option value="WA">WA</option>
          <option value="SA">SA</option>
          <option value="TAS">TAS</option>
          <option value="ACT">ACT</option>
          <option value="NT">NT</option>
        </select>
        <select value={propertyType} onChange={(e) => updateParam('ptype', e.target.value)}>
          <option value="">Any type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="townhouse">Townhouse</option>
          <option value="studio">Studio</option>
          <option value="room">Room</option>
        </select>
        <select value={minBeds} onChange={(e) => updateParam('beds', e.target.value)}>
          <option value="">Any beds</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
        <input
          type="number"
          placeholder="Max $/week"
          defaultValue={maxPrice}
          onChange={(e) => updateParam('maxPrice', e.target.value)}
        />
        <span className="filter-count">
          {loading ? 'Searching…' : `${properties.length} ${properties.length === 1 ? 'home' : 'homes'}`}
        </span>
      </div>

      {isFlatmates && (
        <div className="filter-bar" style={{ flexWrap: 'wrap', gap: 10 }}>
          <select value={fmRoomType} onChange={e => updateParam('room', e.target.value)}>
            <option value="">Any room type</option>
            {ROOM_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={fmMinStay} onChange={e => updateParam('stay', e.target.value)}>
            <option value="">Any stay</option>
            <option value="1">1+ month</option>
            <option value="3">3+ months</option>
            <option value="6">6+ months</option>
            <option value="12">12+ months</option>
          </select>
          <FmChip active={fmBillsIncluded} onClick={() => updateParam('bills', fmBillsIncluded ? '' : '1')}>Bills included</FmChip>
          <FmChip active={fmLgbt} onClick={() => updateParam('lgbt', fmLgbt ? '' : '1')}>🏳️‍🌈 LGBTQIA+ friendly</FmChip>
          <FmChip active={fmWomen} onClick={() => updateParam('women', fmWomen ? '' : '1')}>👩 Women-safe</FmChip>
          <FmChip active={fmCouples} onClick={() => updateParam('couples', fmCouples ? '' : '1')}>Accepts couples</FmChip>
          <FmChip active={fmPets} onClick={() => updateParam('pets', fmPets ? '' : '1')}>🐾 Pet-friendly</FmChip>
          <MultiSelectChip
            label="Languages"
            options={LANGUAGE_OPTIONS}
            selected={fmLang ? fmLang.split(',').filter(Boolean) : []}
            onChange={next => updateParam('lang', next.join(','))}
          />
          <MultiSelectChip
            label="Dietary"
            options={DIETARY_OPTIONS}
            selected={fmDiet ? fmDiet.split(',').filter(Boolean) : []}
            onChange={next => updateParam('diet', next.join(','))}
          />
        </div>
      )}

      <p style={{
        fontSize: 12, color: 'var(--ink-muted)', textAlign: 'right',
        marginTop: -16, marginBottom: 16
      }}>
        ✨ Featured listings appear first
      </p>

      {/* 2-column layout on desktop: main grid + sticky sidebar ad */}
      <div className="search-layout">
        <div className="search-main">
          {loading ? (
            <div className="property-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="property-card">
                  <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                  <div style={{ padding: 20 }}>
                    <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 10 }} />
                    <div className="skeleton" style={{ height: 16, width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <ModeAwareEmptyState mode={listingMode} />
          ) : (
            <div className="property-grid">{cells}</div>
          )}
        </div>
        <aside className="search-sidebar">
          <AdSlot layout="sidebar" />
        </aside>
      </div>
    </section>
  )
}

function FmChip({ active, children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '6px 12px', borderRadius: 999,
      border: `1.5px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
      background: active ? 'var(--mint-soft)' : 'var(--white)',
      color: active ? 'var(--accent)' : 'var(--ink-soft)',
      fontWeight: 600, fontSize: 13, cursor: 'pointer'
    }}>{children}</button>
  )
}

function MultiSelectChip({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  function toggle(v) {
    if (selected.includes(v)) onChange(selected.filter(x => x !== v))
    else onChange([...selected, v])
  }
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        padding: '6px 12px', borderRadius: 999,
        border: `1.5px solid ${selected.length > 0 ? 'var(--accent)' : 'var(--line)'}`,
        background: selected.length > 0 ? 'var(--mint-soft)' : 'var(--white)',
        color: selected.length > 0 ? 'var(--accent)' : 'var(--ink-soft)',
        fontWeight: 600, fontSize: 13, cursor: 'pointer'
      }}>
        {label}{selected.length > 0 ? ` (${selected.length})` : ''} ⌄
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: 'var(--white)', border: '1px solid var(--line)',
          borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 8, zIndex: 60,
          minWidth: 220, maxHeight: 320, overflowY: 'auto'
        }}>
          {options.map(o => {
            const on = selected.includes(o.value)
            return (
              <button key={o.value} type="button" onClick={() => toggle(o.value)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 10px', borderRadius: 8,
                background: on ? 'var(--mint-soft)' : 'transparent',
                color: 'var(--ink)', fontSize: 14, border: 'none', cursor: 'pointer'
              }}>
                {on ? '✓ ' : ''}{o.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ModeAwareEmptyState({ mode }) {
  if (mode === 'buy') {
    return (
      <div className="empty-state">
        <h3>Buy-to-own listings coming soon.</h3>
        <p>We're focusing on rentals first. Meanwhile, browse our rental listings.</p>
        <Link to="/search?type=rent" className="btn btn-dark" style={{ padding: '10px 22px', fontSize: 14, marginTop: 12 }}>
          Browse rentals →
        </Link>
      </div>
    )
  }
  if (mode === 'flatmates') {
    return (
      <div className="empty-state">
        <h3>No flatmate rooms available yet</h3>
        <p>Check back soon, or browse all listings in the meantime.</p>
        <Link to="/search?type=rent" className="btn btn-dark" style={{ padding: '10px 22px', fontSize: 14, marginTop: 12 }}>
          Browse all →
        </Link>
      </div>
    )
  }
  return (
    <div className="empty-state">
      <h3>No properties match your search yet</h3>
      <p>Try widening your filters — fresh listings come in every week.</p>
    </div>
  )
}
