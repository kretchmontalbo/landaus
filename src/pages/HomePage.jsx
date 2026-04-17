import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import PropertyCard from '../components/PropertyCard.jsx'

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [suburb, setSuburb] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [mode, setMode] = useState('rent')
  const navigate = useNavigate()

  useEffect(() => {
    loadFeatured()
  }, [])

  async function loadFeatured() {
    setLoading(true)
    const { data } = await supabase
      .from('properties')
      .select('*, property_images(image_url, display_order)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6)
    setProperties(data || [])
    setLoading(false)
  }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (suburb) params.set('suburb', suburb)
    if (propertyType) params.set('type', propertyType)
    if (maxPrice) params.set('maxPrice', maxPrice)
    params.set('listing', mode)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">🌏 New to Australia? Welcome home.</span>
          <h1 className="hero-title">
            Find home, <em>not rejection.</em>
          </h1>
          <p className="hero-sub">
            Australia's rental portal built for immigrants, students, and newcomers.
            Skip the "no rental history" barrier and connect with landlords who welcome you.
          </p>

          <div className="search-tabs">
            <button
              className={`search-tab ${mode === 'rent' ? 'active' : ''}`}
              onClick={() => setMode('rent')}
            >Rent</button>
            <button
              className={`search-tab ${mode === 'sale' ? 'active' : ''}`}
              onClick={() => setMode('sale')}
            >Buy</button>
            <button className="search-tab">Share</button>
            <button className="search-tab">Suburbs</button>
          </div>

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-group">
              <div style={{ flex: 1 }}>
                <label>Suburb</label>
                <input
                  type="text"
                  placeholder="e.g. Parramatta"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                />
              </div>
            </div>
            <div className="search-divider" />
            <div className="search-input-group">
              <div style={{ flex: 1 }}>
                <label>Property</label>
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                  <option value="">Any type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="studio">Studio</option>
                  <option value="room">Room</option>
                </select>
              </div>
            </div>
            <div className="search-divider" />
            <div className="search-input-group">
              <div style={{ flex: 1 }}>
                <label>Max $/week</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="search-btn" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </form>

          <div className="stat-strip">
            <div className="stat">
              <div className="stat-num">100%</div>
              <div className="stat-lbl">Newcomer-friendly listings</div>
            </div>
            <div className="stat">
              <div className="stat-num">0</div>
              <div className="stat-lbl">Rental history required</div>
            </div>
            <div className="stat">
              <div className="stat-num">10+</div>
              <div className="stat-lbl">Languages supported</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Featured this week</h2>
            <p className="section-sub">Hand-picked homes from landlords who welcome everyone.</p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/search')}
          >View all →</button>
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
            <h3>No properties yet</h3>
            <p>Be the first to list a home for newcomers.</p>
          </div>
        ) : (
          <div className="property-grid">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>

      <section className="why-section">
        <div className="why-inner">
          <div>
            <h2>Built for people who've been <em>told no.</em></h2>
            <p>
              We've all been there: the perfect place, a ready cheque, and a landlord
              who says "sorry, no rental history." LandAus flips the script. Every listing
              here is from a landlord who says <em style={{ color: 'var(--mint)', fontStyle: 'italic' }}>yes</em> first.
            </p>
          </div>
          <div className="why-features">
            <div className="why-feature">
              <div className="why-feature-icon">🌟</div>
              <div>
                <h4>No rental history? No problem.</h4>
                <p>Employment letters, bank statements, and visa docs accepted as alternative references.</p>
              </div>
            </div>
            <div className="why-feature">
              <div className="why-feature-icon">🌐</div>
              <div>
                <h4>Multilingual landlords</h4>
                <p>Filter by language. Find landlords who speak yours.</p>
              </div>
            </div>
            <div className="why-feature">
              <div className="why-feature-icon">🧭</div>
              <div>
                <h4>Suburb guides for newcomers</h4>
                <p>Transport, safety, community, halal & Asian grocery proximity — we tell you what matters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
