import { Link } from 'react-router-dom'

const HERO_PHOTO = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85'

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
          Built for newcomers. Honest about everything.
        </p>
        <div className="hero-fallback-ctas">
          <Link to="/search" className="btn btn-primary hero-fallback-cta">Start searching</Link>
          <Link to="/list-property" className="btn hero-fallback-cta hero-fallback-cta-ghost">List a property</Link>
        </div>
      </div>
    </section>
  )
}
