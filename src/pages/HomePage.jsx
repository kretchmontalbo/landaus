import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import PropertyCard from '../components/PropertyCard.jsx'
import AdSlot from '../components/AdSlot.jsx'
import AnimatedStat from '../components/AnimatedStat.jsx'
import Arrow from '../components/Arrow.jsx'
import ModeTabs from '../components/ModeTabs.jsx'
import SEO from '../components/SEO.jsx'
import SuburbAutocomplete from '../components/SuburbAutocomplete.jsx'
import { getActiveFeaturedIds, applyFeaturedMerge } from '../lib/featured.js'
import { useReveal } from '../lib/useReveal.js'

const TAGLINES = [
  'Find home, not rejection.',
  'Yes-first rentals.',
  'Built for the overlooked.',
  "Your visa isn't a red flag.",
  'Newcomer-friendly always.'
]

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [suburb, setSuburb] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [mode, setMode] = useState('rent')
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [activeCount, setActiveCount] = useState(null)
  const [suburbCount, setSuburbCount] = useState(null)
  const heroInnerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadFeatured()
    loadCounts()
  }, [])

  // Parallax on hero content
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        if (heroInnerRef.current) {
          const y = window.scrollY * -0.3
          heroInnerRef.current.style.transform = `translate3d(0, ${y}px, 0)`
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function loadCounts() {
    const [activeRes, suburbRes] = await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('suburb_guides').select('id', { count: 'exact', head: true })
    ])
    setActiveCount(activeRes.count ?? 0)
    setSuburbCount(suburbRes.count ?? 0)
  }

  // Rotating tagline — respect prefers-reduced-motion
  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => {
      setTaglineIdx(i => (i + 1) % TAGLINES.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  async function loadFeatured() {
    setLoading(true)
    const [{ data }, featuredIds] = await Promise.all([
      supabase
        .from('properties')
        .select('*, property_images(image_url, display_order), profiles(verified)')
        .eq('status', 'active')
        .order('is_featured', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(6),
      getActiveFeaturedIds()
    ])
    setProperties(applyFeaturedMerge(data || [], featuredIds))
    setLoading(false)
  }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('type', mode)
    if (stateFilter) params.set('state', stateFilter)
    if (suburb) params.set('suburb', suburb)
    if (propertyType) params.set('ptype', propertyType)
    if (maxPrice) params.set('maxPrice', maxPrice)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <>
      <SEO
        title="Australia's rental platform for newcomers"
        description="Find a home without rental history barriers. LandAus connects immigrants, students, and newcomers with landlords who welcome everyone."
        path="/"
      />
      <section className="hero hero-cinematic">
        <span className="aurora aurora-a" aria-hidden="true" />
        <span className="aurora aurora-b" aria-hidden="true" />
        <span className="aurora aurora-c" aria-hidden="true" />
        <div className="hero-inner" ref={heroInnerRef}>
          <span className="eyebrow">🌍 Australia's rental platform for tenants without local rental history</span>
          <h1 className="hero-title">
            Find home, <em>not rejection.</em>
          </h1>
          <div
            className="hero-tagline"
            key={taglineIdx}
            aria-live="polite"
          >
            {TAGLINES[taglineIdx]}
          </div>
          <p className="hero-sub">
            Australia's rental portal built for immigrants, students, and newcomers.
            Skip the "no rental history" barrier and connect with landlords who welcome you.
          </p>

          <ModeTabs activeTab={mode} />

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-group">
              <div style={{ flex: 1 }}>
                <label>State</label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  aria-label="State"
                >
                  <option value="">All states</option>
                  <option value="NSW">NSW</option>
                  <option value="VIC">VIC</option>
                  <option value="QLD">QLD</option>
                  <option value="WA">WA</option>
                  <option value="SA">SA</option>
                  <option value="TAS">TAS</option>
                  <option value="ACT">ACT</option>
                  <option value="NT">NT</option>
                </select>
              </div>
            </div>
            <div className="search-divider" />
            <div className="search-input-group">
              <div style={{ flex: 1 }}>
                <label>Suburb</label>
                <SuburbAutocomplete
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  onPickState={(s) => setStateFilter(s)}
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
              <div className="stat-num"><AnimatedStat to={100} suffix="%" /></div>
              <div className="stat-lbl">Yes-first listings</div>
            </div>
            <div className="stat">
              <div className="stat-num">✓</div>
              <div className="stat-lbl">ID-verified landlords</div>
            </div>
            <div className="stat">
              <div className="stat-num">$0</div>
              <div className="stat-lbl">Tenant fees, ever</div>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Explore sample homes</h2>
            <p className="section-sub">A preview of what real LandAus listings will look like. We're onboarding verified landlords now — your home could be next.</p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/search')}
          >View all<Arrow /></button>
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
            <h3>No listings live yet — but soon</h3>
            <p>We're hand-onboarding our first landlords now. Be the first to list a home for newcomers.</p>
          </div>
        ) : (
          <div className="property-grid">
            {properties.map((p, i) => (
              <RevealCard key={p.id} delay={i * 90}>
                <PropertyCard property={p} />
              </RevealCard>
            ))}
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
                <h4>Language-matched households</h4>
                <p>Landlords list the languages spoken at home. Filter to find a household that speaks yours.</p>
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

      <NumbersSection activeCount={activeCount} suburbCount={suburbCount} />

      <FinalCta />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 48px', display: 'flex', justifyContent: 'center' }}>
        <AdSlot layout="horizontal" />
      </div>
    </>
  )
}

/* ---------- Reveal wrapper ---------- */
function RevealCard({ children, delay = 0 }) {
  const [ref, shown] = useReveal()
  return (
    <div ref={ref} className={`reveal ${shown ? 'revealed' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ---------- Trust strip ---------- */
const TRUST_ITEMS = [
  { icon: '🛡', label: 'ID-verified landlords only' },
  { icon: '💚', label: 'Free forever for tenants' },
  { icon: '🏡', label: 'Hand-reviewed listings' },
  { icon: '🇦🇺', label: 'Built and hosted in Sydney' },
  { icon: '⭐', label: 'New to Australia? Welcome home.' },
  { icon: '🔒', label: 'Bank-grade encryption' },
  { icon: '🌏', label: 'Cultural community matched' }
]

function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Why LandAus is trustworthy">
      <div className="trust-strip-track">
        {[...TRUST_ITEMS, ...TRUST_ITEMS].map((t, i) => (
          <span key={i} className="trust-item">
            <span className="trust-icon">{t.icon}</span>
            <span>{t.label}</span>
            <span className="trust-dot" aria-hidden="true" />
          </span>
        ))}
      </div>
    </section>
  )
}

/* ---------- Numbers section ---------- */
function NumbersSection({ activeCount, suburbCount }) {
  const [headRef, headShown] = useReveal()
  const [aRef, aShown] = useReveal()
  const [bRef, bShown] = useReveal()
  const [cRef, cShown] = useReveal()

  return (
    <section className="numbers-section">
      <div ref={headRef} className={`reveal reveal-left ${headShown ? 'revealed' : ''}`} style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 className="numbers-h">
          The numbers behind the <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 500 }}>mission.</em>
        </h2>
        <p className="numbers-sub">We're just getting started — here's what we're tracking.</p>
      </div>

      <div className="numbers-grid">
        <div ref={aRef} className={`numbers-block reveal ${aShown ? 'revealed' : ''}`}>
          <div className="numbers-value">
            {activeCount != null ? <AnimatedStat to={activeCount} /> : '—'}
          </div>
          <div className="numbers-label">Active listings</div>
          <div className="numbers-note">
            {activeCount != null ? `${activeCount} live, growing weekly.` : 'Counting live listings…'}
          </div>
        </div>

        <div ref={bRef} className={`numbers-block reveal ${bShown ? 'revealed' : ''}`} style={{ transitionDelay: '100ms' }}>
          <div className="numbers-value">
            {suburbCount != null ? <AnimatedStat to={suburbCount} /> : '—'}
          </div>
          <div className="numbers-label">Suburbs covered</div>
          <div className="numbers-note">Honest, newcomer-focused guides.</div>
        </div>

        <div ref={cRef} className={`numbers-block reveal ${cShown ? 'revealed' : ''}`} style={{ transitionDelay: '200ms' }}>
          <div className="numbers-value">8</div>
          <div className="numbers-label">States + territories</div>
          <div className="numbers-note">Every corner of Australia.</div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Final CTA ---------- */
function FinalCta() {
  return (
    <section className="final-cta">
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 15 }).map((_, i) => (
          <span key={i} className="particle" style={{
            left: `${(i * 7 + 4) % 100}%`,
            animationDelay: `${(i * 1.3) % 20}s`,
            animationDuration: `${18 + (i % 6) * 2}s`,
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`
          }} />
        ))}
      </div>
      <div className="final-cta-inner">
        <h2 className="final-cta-title">
          Ready to find <em style={{ fontStyle: 'italic', color: 'var(--mint)', fontWeight: 500 }}>home?</em>
        </h2>
        <p className="final-cta-sub">
          Create your free profile in 60 seconds. No credit card. No catch.
        </p>
        <Link to="/signup" className="btn btn-cta-xl">
          Create free account<Arrow size={18} />
        </Link>
        <p className="final-cta-foot">
          Are you a landlord? <Link to="/for-landlords" style={{ color: 'var(--mint)', fontWeight: 600 }}>List for free</Link>
        </p>
      </div>
    </section>
  )
}
