import { Link } from 'react-router-dom'
import VerifiedBadge from './VerifiedBadge.jsx'

export default function PropertyCard({ property }) {
  const img = property.property_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800'
  const isDemo = property.title?.startsWith('[DEMO]')
  const isFeatured = !!property.is_featured
  const displayTitle = isDemo ? property.title.replace(/^\[DEMO\]\s*/, '') : property.title

  return (
    <Link to={`/property/${property.id}`} className="property-card"
      style={isFeatured ? { border: '2px solid #F7C948', boxShadow: '0 4px 16px rgba(247, 201, 72, 0.2)' } : {}}>
      <div className="property-image">
        <img src={img} alt={displayTitle} />
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
            background: '#FBBF24', color: '#78350F', borderRadius: 999,
            fontSize: 11, padding: '4px 10px', fontWeight: 700, zIndex: 2
          }}>🎭 DEMO LISTING</span>
        )}
        {property.newcomer_friendly && (
          <span className="property-badge">✨ Newcomer friendly</span>
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
          {property.profiles?.verified && <VerifiedBadge size={16} />}
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
