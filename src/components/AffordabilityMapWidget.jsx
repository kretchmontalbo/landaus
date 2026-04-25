import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

// Approximate Sydney suburb coordinates on a 0–100 normalized SVG canvas.
// (Not geographically perfect — a stylised map for at-a-glance affordability.)
const SUBURB_COORDS = {
  Sydney: { x: 64, y: 56 },
  Newtown: { x: 56, y: 60 },
  'Surry Hills': { x: 62, y: 58 },
  Parramatta: { x: 36, y: 50 },
  'Harris Park': { x: 38, y: 52 },
  Lakemba: { x: 48, y: 64 },
  Cabramatta: { x: 24, y: 68 },
  Auburn: { x: 38, y: 56 },
  Eastwood: { x: 44, y: 38 },
  Blacktown: { x: 24, y: 42 },
  Bondi: { x: 78, y: 60 },
  Manly: { x: 76, y: 38 },
  Chatswood: { x: 56, y: 36 },
  Hurstville: { x: 50, y: 76 },
  Liverpool: { x: 18, y: 64 },
  Penrith: { x: 8, y: 46 }
}

const FALLBACK_SUBURBS = [
  { suburb: 'Lakemba',      state: 'NSW', median_rent_weekly: 480 },
  { suburb: 'Cabramatta',   state: 'NSW', median_rent_weekly: 520 },
  { suburb: 'Newtown',      state: 'NSW', median_rent_weekly: 720 },
  { suburb: 'Eastwood',     state: 'NSW', median_rent_weekly: 650 },
  { suburb: 'Harris Park',  state: 'NSW', median_rent_weekly: 540 },
  { suburb: 'Auburn',       state: 'NSW', median_rent_weekly: 510 },
  { suburb: 'Blacktown',    state: 'NSW', median_rent_weekly: 470 },
  { suburb: 'Parramatta',   state: 'NSW', median_rent_weekly: 600 },
  { suburb: 'Surry Hills',  state: 'NSW', median_rent_weekly: 880 },
  { suburb: 'Bondi',        state: 'NSW', median_rent_weekly: 950 }
]

function classify(medianRent, weeklyIncome) {
  if (!weeklyIncome || !medianRent) return 'unknown'
  const ratio = medianRent / weeklyIncome
  if (ratio <= 0.30) return 'affordable'
  if (ratio <= 0.40) return 'stretch'
  return 'unaffordable'
}

function slugify(s, st) {
  return `${(s || '').toLowerCase().replace(/\s+/g, '-')}-${(st || '').toLowerCase()}`
}

export default function AffordabilityMapWidget() {
  const navigate = useNavigate()
  const [income, setIncome] = useState(1200)
  const [suburbs, setSuburbs] = useState(FALLBACK_SUBURBS)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await supabase
          .from('suburb_guides')
          .select('suburb, state, median_rent_weekly')
          .not('median_rent_weekly', 'is', null)
          .limit(20)
        if (cancelled) return
        if (data && data.length >= 5) setSuburbs(data)
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [])

  const dots = useMemo(() => suburbs
    .map(s => {
      const coords = SUBURB_COORDS[s.suburb] || SUBURB_COORDS[(s.suburb || '').split(' ')[0]]
      if (!coords) return null
      return {
        ...s,
        ...coords,
        status: classify(s.median_rent_weekly, income)
      }
    })
    .filter(Boolean), [suburbs, income])

  const counts = dots.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1
    return acc
  }, {})

  return (
    <section className="afford-widget">
      <div className="afford-widget-head">
        <h2>What can you <em>afford?</em></h2>
        <p>Drag the slider — Sydney suburbs recolour based on what fits under 30% of your weekly income.</p>
      </div>
      <div className="afford-widget-grid">
        {/* LEFT: income input */}
        <div className="afford-input-col">
          <label htmlFor="afford-slider" className="afford-input-label">
            Your weekly income (after tax)
          </label>
          <div className="afford-input-row">
            <span className="afford-currency">$</span>
            <input
              type="number"
              min="400"
              max="3000"
              step="50"
              value={income}
              onChange={e => setIncome(parseInt(e.target.value, 10) || 0)}
              className="afford-input-num"
              aria-label="Weekly income (after tax)"
            />
            <span className="afford-suffix">/wk</span>
          </div>
          <input
            id="afford-slider"
            type="range"
            min="400"
            max="3000"
            step="50"
            value={income}
            onChange={e => setIncome(parseInt(e.target.value, 10))}
            className="afford-slider"
            aria-label="Weekly income slider"
          />
          <div className="afford-slider-track-labels">
            <span>$400</span>
            <span>$1,500</span>
            <span>$3,000</span>
          </div>

          <div className="afford-hint">
            Rule of thumb: rent under <strong>30%</strong> of income (Australian fair-housing guideline).
          </div>

          <div className="afford-summary">
            <div className="afford-30 afford-row">
              <span className="afford-dot afford-dot-affordable" /> Affordable
              <strong>{counts.affordable || 0}</strong>
            </div>
            <div className="afford-30 afford-row">
              <span className="afford-dot afford-dot-stretch" /> Stretch (30–40%)
              <strong>{counts.stretch || 0}</strong>
            </div>
            <div className="afford-30 afford-row">
              <span className="afford-dot afford-dot-unaffordable" /> Out of reach
              <strong>{counts.unaffordable || 0}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT: stylised Sydney map */}
        <div className="afford-map-col">
          <svg viewBox="0 0 100 100" className="afford-map-svg" role="img" aria-label="Sydney suburb affordability map">
            {/* Stylised coastline + harbour silhouette */}
            <defs>
              <linearGradient id="afford-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E6FDF5" />
                <stop offset="100%" stopColor="#F4FEFA" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#afford-bg)" />
            {/* Approximate ocean */}
            <path d="M 82 0 Q 86 30 88 50 Q 90 75 94 100 L 100 100 L 100 0 Z" fill="#B2FCE4" opacity="0.6" />
            {/* Approximate harbour */}
            <path d="M 60 50 Q 70 48 78 52 Q 84 56 86 60 L 78 62 Q 72 56 64 56 Q 60 56 58 54 Z" fill="#B2FCE4" opacity="0.7" />
            {/* Faint road grid */}
            <g stroke="rgba(11, 93, 59, 0.08)" strokeWidth="0.3">
              <line x1="0" y1="40" x2="100" y2="40" />
              <line x1="0" y1="60" x2="100" y2="60" />
              <line x1="40" y1="0" x2="40" y2="100" />
              <line x1="60" y1="0" x2="60" y2="100" />
            </g>

            {/* Dots */}
            {dots.map(d => {
              const fill = d.status === 'affordable' ? '#16A34A'
                : d.status === 'stretch' ? '#EAB308'
                : '#DC2626'
              return (
                <g
                  key={`${d.suburb}-${d.state}`}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => navigate(`/suburbs/${slugify(d.suburb, d.state)}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={d.x} cy={d.y} r="2.6" fill={fill} stroke="#fff" strokeWidth="0.6" />
                  <circle cx={d.x} cy={d.y} r="4.2" fill={fill} opacity="0.25" className="afford-dot-pulse" />
                </g>
              )
            })}
          </svg>

          {hovered && (
            <div className="afford-tooltip">
              <strong>{hovered.suburb}, {hovered.state}</strong>
              <span>${hovered.median_rent_weekly}/wk median</span>
              <span className={`afford-badge afford-badge-${hovered.status}`}>
                {hovered.status === 'affordable' ? 'Within 30% — fits comfortably'
                  : hovered.status === 'stretch' ? 'Stretch (30–40% of income)'
                  : 'Over 40% — out of reach'}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
