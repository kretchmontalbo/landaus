import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import PropertyCard from '../components/PropertyCard.jsx'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  const suburb = searchParams.get('suburb') || ''
  const state = searchParams.get('state') || ''
  const propertyType = searchParams.get('type') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const minBeds = searchParams.get('beds') || ''

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

    query = query.order('is_featured', { ascending: false, nullsFirst: false })
                 .order('created_at', { ascending: false })
    const { data } = await query
    setProperties(data || [])
    setLoading(false)
  }

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2 className="section-title">
            {suburb ? `Homes in ${suburb}` : 'All properties'}
          </h2>
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
        <select value={propertyType} onChange={(e) => updateParam('type', e.target.value)}>
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
        <div className="empty-state">
          <h3>No matches yet</h3>
          <p>Try widening your filters — new listings come in daily.</p>
        </div>
      ) : (
        <div className="property-grid">
          {properties.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </section>
  )
}
