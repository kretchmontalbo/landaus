import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import VerifiedBadge from './VerifiedBadge.jsx'
import { hasBeenViewed } from '../lib/recentViews.js'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800'

export default function PropertyCard({ property, style }) {
  const images = property.property_images?.length
    ? property.property_images
        .slice()
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(i => i.image_url)
    : [FALLBACK_IMG]

  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)
  const isDemo = property.title?.startsWith('[DEMO]')
  const isFeatured = !!property.is_featured
  const displayTitle = isDemo ? property.title.replace(/^\[DEMO\]\s*/, '') : property.title
  const verified = property.profiles?.verified || property.profiles?.verification_status === 'approved'

  const [isViewed, setIsViewed] = useState(false)
  useEffect(() => { setIsViewed(hasBeenViewed(property.id)) }, [property.id])

  // Auto-slideshow — pause on hover, respect reduced motion
  useEffect(() => {
    if (images.length < 2 || hover) return
    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 4000)
    return () => clearInterval(t)
  }, [images.length, hover])

  return (
    <Link
      to={`/property/${property.id}`}
      className="property-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={isFeatured
        ? { border: '2px solid #F7C948', boxShadow: '0 4px 16px rgba(247, 201, 72, 0.2)', ...style }
        : style}
    >
      <div className="property-image">
        {images.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt={displayTitle}
            style={{
              position: i === 0 ? 'relative' : 'absolute',
              inset: 0,
              opacity: i === idx ? 1 : 0,
              transition: 'opacity 0.7s ease'
            }}
          />
        ))}

        {isFeatured && (
          <span style={{
            position: 'absolute', top: 14, right: 56,
            background: '#F7C948', color: '#78350F', borderRadius: 999,
            fontSize: 11, padding: '4px 10px', fontWeight: 700, zIndex: 2,
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>⭐ FEATURED</span>
        )}
        {isDemo && !isFeatured && (
          <span style={{
            position: 'absolute', top: 14, right: 56,
            background: 'var(--mint)', color: 'var(--accent)', borderRadius: 999,
            fontSize: 11, padding: '4px 10px', fontWeight: 600, zIndex: 2
          }}>✨ Sample listing</span>
        )}
        {property.newcomer_friendly && (
          <span className="property-badge">✨ Newcomer friendly</span>
        )}
        {verified && (
          <span className="property-verified-shield" title="ID-verified landlord" aria-label="ID-verified landlord">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </span>
        )}
        {isViewed && (
          <span
            className="property-recent-pulse"
            title="You recently viewed this"
            aria-label="Recently viewed"
          />
        )}

        {/* slideshow dots */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 10, left: 0, right: 0,
            display: 'flex', gap: 4, justifyContent: 'center', zIndex: 2
          }}>
            {images.map((_, i) => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === idx ? 'white' : 'rgba(255,255,255,0.55)',
                transition: 'background 0.25s'
              }} />
            ))}
          </div>
        )}

        <button
          className="property-save"
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          aria-label="Save"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div className="property-body">
        <div className="property-price" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>${property.price_per_week}<small> / week</small></span>
          {verified && <VerifiedBadge size={16} />}
        </div>
        <div className="property-address">
          {displayTitle}<br />
          {property.suburb}, {property.state} {property.postcode}
        </div>
        <div className="property-meta">
          <span className="property-meta-item">🛏 {property.bedrooms}</span>
          <span className="property-meta-item">🛁 {property.bathrooms}</span>
          <span className="property-meta-item">🚗 {property.parking}</span>
          <span className="property-meta-item" style={{ marginLeft: 'auto', textTransform: 'capitalize' }}>
            {property.property_type}
          </span>
        </div>
      </div>
    </Link>
  )
}
