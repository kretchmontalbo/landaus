import { Link } from 'react-router-dom'

// Universal Aussie home — golden hour suburban scene (not city-specific)
const HERO_PHOTO = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=85'

export default function StaticHeroFallback() {
  return (
    <section
      className="hero-fallback"
      style={{ backgroundImage: `url(${HERO_PHOTO})` }}
    >
      <div className="hero-fallback-overlay" aria-hidden="true" />
      <div className="hero-fallback-inner">
        <div className="hero-fallback-mintline" aria-hidden="true" />
        <h1 className="hero-fallback-title">
          Find your home in <em>Australia.</em>
        </h1>
        <p className="hero-fallback-sub">
          From Sydney to Perth, Melbourne to Darwin — built for newcomers, honest about everything.
        </p>
        <div className="hero-fallback-ctas">
          <Link to="/search" className="btn btn-primary hero-fallback-cta">Start searching</Link>
          <Link to="/list-property" className="btn hero-fallback-cta hero-fallback-cta-ghost">List a property</Link>
        </div>
        <p className="hero-fallback-trust">
          Listings in 6 states · Real verified landlords · Free for tenants forever
        </p>
      </div>
    </section>
  )
}
