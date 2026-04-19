import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabase.js'

// POI categories: colors + emoji icons
const POI_CATEGORIES = {
  filipino_grocer:      { label: 'Filipino grocers',      color: '#DC2626', emoji: '🛒', defaultOn: true  },
  asian_grocer:         { label: 'Asian grocers',         color: '#EA580C', emoji: '🛒', defaultOn: true  },
  halal_food:           { label: 'Halal food',            color: '#16A34A', emoji: '🍽️', defaultOn: true  },
  indian_grocer:        { label: 'Indian grocers',        color: '#EAB308', emoji: '🛒', defaultOn: true  },
  international_school: { label: 'International schools', color: '#2563EB', emoji: '🏫', defaultOn: false },
  community_center:     { label: 'Community centers',     color: '#9333EA', emoji: '👥', defaultOn: true  },
  religious_center:     { label: 'Religious centers',     color: '#6B7280', emoji: '🏛️', defaultOn: false },
  migrant_support:      { label: 'Migrant support',       color: '#0D9488', emoji: '💚', defaultOn: true  },
  transit_hub:          { label: 'Transit hubs',          color: '#1F2937', emoji: '🚉', defaultOn: false }
}

const CITY_PRESETS = [
  { name: 'Sydney',   lat: -33.8688, lng: 151.2093, zoom: 11 },
  { name: 'Melbourne',lat: -37.8136, lng: 144.9631, zoom: 11 },
  { name: 'Brisbane', lat: -27.4698, lng: 153.0251, zoom: 11 },
  { name: 'Perth',    lat: -31.9523, lng: 115.8613, zoom: 11 },
  { name: 'Adelaide', lat: -34.9285, lng: 138.6007, zoom: 11 },
  { name: 'Canberra', lat: -35.2809, lng: 149.1300, zoom: 11 }
]

const LIGHT_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const DARK_TILE = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'

function makeIcon({ color, emoji, isProperty = false }) {
  const html = isProperty
    ? `<div class="map-pin map-pin-property" style="--pin-color: ${color}">
         <span class="map-pin-inner">🏡</span>
       </div>`
    : `<div class="map-pin" style="--pin-color: ${color}">
         <span class="map-pin-inner">${emoji}</span>
       </div>`
  return L.divIcon({
    html,
    className: 'landaus-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 36],
    popupAnchor: [0, -34]
  })
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 })
  }, [target, map])
  return null
}

export default function NewcomerMapPage() {
  const [properties, setProperties] = useState([])
  const [pois, setPois] = useState([])
  const [loaded, setLoaded] = useState(false)

  const [showProperties, setShowProperties] = useState(true)
  const [priceMax, setPriceMax] = useState(2000)
  const [minBeds, setMinBeds] = useState(0)
  const [enabledCats, setEnabledCats] = useState(() => {
    const initial = {}
    Object.entries(POI_CATEGORIES).forEach(([k, v]) => { initial[k] = v.defaultOn })
    return initial
  })
  const [legendOpen, setLegendOpen] = useState(true)
  const [flyTarget, setFlyTarget] = useState(null)
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined'
      && document.documentElement.getAttribute('data-theme') === 'dark'
  )

  // Watch for theme changes and swap tiles
  useEffect(() => {
    if (typeof document === 'undefined') return
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // Load data
  useEffect(() => {
    async function load() {
      const [propRes, poiRes] = await Promise.all([
        supabase
          .from('properties')
          .select('id, title, price_per_week, bedrooms, bathrooms, suburb, state, latitude, longitude, property_images(image_url, display_order)')
          .eq('status', 'active')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null),
        supabase
          .from('cultural_pois')
          .select('id, name, category, notes, latitude, longitude')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
      ])
      setProperties(propRes.data || [])
      setPois(poiRes.data || [])
      setLoaded(true)
    }
    load()
  }, [])

  // Pre-build icon instances per POI category
  const poiIcons = useMemo(() => {
    const m = {}
    Object.entries(POI_CATEGORIES).forEach(([key, cfg]) => {
      m[key] = makeIcon(cfg)
    })
    return m
  }, [])
  const propertyIcon = useMemo(() => makeIcon({ color: '#0B5D3B', emoji: '🏡', isProperty: true }), [])

  const filteredProperties = showProperties
    ? properties.filter(p => {
        if (p.price_per_week != null && p.price_per_week > priceMax) return false
        if (minBeds > 0 && (p.bedrooms || 0) < minBeds) return false
        return true
      })
    : []

  const filteredPois = pois.filter(p => enabledCats[p.category])

  function toggleCat(key) {
    setEnabledCats(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleAll(value) {
    const next = {}
    Object.keys(POI_CATEGORIES).forEach(k => { next[k] = value })
    setEnabledCats(next)
  }

  return (
    <div className="map-page">
      {/* Sidebar */}
      <aside className="map-sidebar" aria-label="Map filters">
        <div className="map-sidebar-inner">
          <h2 className="map-sidebar-h">Filter the map</h2>

          {/* Property filters */}
          <section className="map-filter-group">
            <label className="map-check">
              <input
                type="checkbox"
                checked={showProperties}
                onChange={e => setShowProperties(e.target.checked)}
                aria-label="Show properties"
              />
              <span><strong>🏡 Show properties</strong></span>
            </label>

            <div className="map-field">
              <label>Max rent: <strong>${priceMax}/week</strong></label>
              <input
                type="range" min="200" max="2000" step="50"
                value={priceMax}
                onChange={e => setPriceMax(parseInt(e.target.value, 10))}
                aria-label="Maximum weekly rent"
                disabled={!showProperties}
              />
            </div>

            <div className="map-field">
              <label>Bedrooms</label>
              <div className="map-beds">
                {[0, 1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => setMinBeds(n)}
                    className={`map-bed-chip ${minBeds === n ? 'active' : ''}`}
                    disabled={!showProperties}
                  >
                    {n === 0 ? 'Any' : `${n}+`}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* POI toggles */}
          <section className="map-filter-group">
            <h3 className="map-subh">Cultural & community points</h3>
            {Object.entries(POI_CATEGORIES).map(([key, cfg]) => (
              <label key={key} className="map-check">
                <input
                  type="checkbox"
                  checked={!!enabledCats[key]}
                  onChange={() => toggleCat(key)}
                  aria-label={`Toggle ${cfg.label}`}
                />
                <span className="map-dot" style={{ background: cfg.color }} aria-hidden="true" />
                <span>{cfg.label}</span>
              </label>
            ))}
            <div className="map-actions">
              <button onClick={() => toggleAll(true)}>Toggle all on</button>
              <span className="map-actions-sep">·</span>
              <button onClick={() => toggleAll(false)}>Clear all</button>
            </div>
          </section>

          {/* Legend */}
          <section className="map-filter-group">
            <button
              className="map-subh map-collapse"
              onClick={() => setLegendOpen(o => !o)}
              aria-expanded={legendOpen}
            >
              <span>What do the pins mean?</span>
              <span style={{ transform: legendOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>⌄</span>
            </button>
            {legendOpen && (
              <div className="map-legend">
                <div className="map-legend-row">
                  <span className="map-dot" style={{ background: '#0B5D3B' }} /> Property listing
                </div>
                {Object.entries(POI_CATEGORIES).map(([key, cfg]) => (
                  <div key={key} className="map-legend-row">
                    <span className="map-dot" style={{ background: cfg.color }} /> {cfg.label}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Fly-to */}
          <section className="map-filter-group">
            <h3 className="map-subh">Fly to</h3>
            <div className="map-cities">
              {CITY_PRESETS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setFlyTarget({ ...c, _t: Date.now() })}
                  className="map-city"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </section>

          <section className="map-filter-group">
            <Link to="/search" className="btn btn-ghost btn-block" style={{ fontSize: 13 }}>
              View as a list instead
            </Link>
          </section>
        </div>
      </aside>

      {/* Map */}
      <div className="map-wrap">
        <div className="map-info-pill">
          Showing <strong>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'home' : 'homes'} +{' '}
          <strong>{filteredPois.length}</strong> {filteredPois.length === 1 ? 'POI' : 'POIs'}
          {!loaded && <span style={{ marginLeft: 8, color: 'var(--ink-muted)' }}>loading…</span>}
        </div>

        <MapContainer
          center={[-33.8688, 151.2093]}
          zoom={11}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
          attributionControl
        >
          <TileLayer
            key={isDark ? 'dark' : 'light'}
            url={isDark ? DARK_TILE : LIGHT_TILE}
            attribution={isDark
              ? '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
              : '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            }
          />

          <FlyTo target={flyTarget} />

          {filteredProperties.map(p => (
            <Marker key={`prop-${p.id}`} position={[p.latitude, p.longitude]} icon={propertyIcon}>
              <Popup>
                <div style={{ minWidth: 200 }}>
                  {p.property_images?.[0]?.image_url && (
                    <img
                      src={p.property_images[0].image_url}
                      alt=""
                      style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                    />
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>
                    {(p.title || '').replace(/^\[DEMO\]\s*/, '')}
                  </div>
                  <div style={{ fontSize: 13, color: '#3D4E66', marginBottom: 6 }}>
                    {p.suburb}, {p.state}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#0A2540', marginBottom: 8 }}>
                    ${p.price_per_week}<span style={{ fontSize: 12, fontWeight: 400, color: '#6B7A8F' }}> / week</span>
                  </div>
                  <Link
                    to={`/property/${p.id}`}
                    style={{
                      display: 'inline-block', background: '#0A2540', color: '#fff',
                      padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600
                    }}
                  >
                    View property →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}

          {filteredPois.map(p => (
            <Marker
              key={`poi-${p.id}`}
              position={[p.latitude, p.longitude]}
              icon={poiIcons[p.category] || poiIcons.community_center}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                    {p.name}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                    background: (POI_CATEGORIES[p.category]?.color || '#999') + '22',
                    color: POI_CATEGORIES[p.category]?.color || '#333',
                    marginBottom: 8
                  }}>
                    {POI_CATEGORIES[p.category]?.label || p.category}
                  </div>
                  {p.notes && (
                    <p style={{ fontSize: 13, color: '#3D4E66', lineHeight: 1.5, margin: 0 }}>{p.notes}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
