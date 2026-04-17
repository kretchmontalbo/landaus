import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import PropertyCard from '../components/PropertyCard.jsx'
import ReportButton from '../components/ReportButton.jsx'

export default function SuburbDetailPage() {
  const { slug } = useParams()
  const [guide, setGuide] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  // slug format: suburb-name-state (e.g. "wentworth-point-nsw")
  useEffect(() => { load() }, [slug])

  async function load() {
    setLoading(true)
    const parts = slug.split('-')
    const state = parts[parts.length - 1].toUpperCase()
    const suburb = parts.slice(0, -1).join(' ').replace(/\b\w/g, c => c.toUpperCase())

    const { data: guideData } = await supabase
      .from('suburb_guides')
      .select('*')
      .eq('state', state)
      .ilike('suburb', suburb)
      .maybeSingle()

    const { data: propsData } = await supabase
      .from('properties')
      .select('*, property_images(image_url)')
      .ilike('suburb', suburb)
      .eq('state', state)
      .eq('status', 'active')
      .limit(6)

    setGuide(guideData)
    setProperties(propsData || [])
    setLoading(false)
  }

  if (loading) return <div style={{ padding: 64, textAlign: 'center' }}>Loading…</div>
  if (!guide) return (
    <div className="empty-state">
      <h3>Suburb guide not found</h3>
      <Link to="/suburbs" className="btn btn-primary" style={{ marginTop: 16 }}>Browse all guides</Link>
    </div>
  )

  return (
    <>
      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft), var(--mint))',
        padding: '48px 20px'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link to="/suburbs" className="back-link">← All suburb guides</Link>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8
          }}>
            {guide.suburb}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-soft)', marginTop: 8 }}>
            {guide.state} · {guide.postcode}
          </p>
        </div>
      </section>

      <section className="section">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 48 }}>
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 10 }}>
                The Vibe
              </h2>
              <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                {guide.overview}
              </p>
            </div>

            {guide.cultural_diversity_note && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 10 }}>
                  Community
                </h2>
                <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                  {guide.cultural_diversity_note}
                </p>
              </div>
            )}

            {guide.transport_info && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 10 }}>
                  🚆 Getting around
                </h2>
                <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                  {guide.transport_info}
                </p>
              </div>
            )}

            {guide.nearby_amenities && guide.nearby_amenities.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 10 }}>
                  📍 What's nearby
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {guide.nearby_amenities.map(a => (
                    <span key={a} className="signal-tag">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>
            <div style={{
              background: 'var(--white)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
                Quick stats
              </h3>
              <Stat label="Avg weekly rent" value={`$${guide.average_rent || '—'}`} />
              <Stat label="Safety" value={`${guide.safety_rating}/5`} icon="🛡" />
              <Stat label="Family-friendly" value={`${guide.family_friendly_rating}/5`} icon="👨‍👩‍👧" />
              <Link to={`/search?suburb=${encodeURIComponent(guide.suburb)}&state=${guide.state}`}
                className="btn btn-dark btn-block" style={{ marginTop: 16 }}>
                View {properties.length} {properties.length === 1 ? 'home' : 'homes'} →
              </Link>
            </div>
          </aside>
        </div>

        {properties.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, marginBottom: 20 }}>
              Available in {guide.suburb}
            </h2>
            <div className="property-grid">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        )}

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <ReportButton targetType="suburb_guide" targetId={guide.id} />
        </div>
      </section>
    </>
  )
}

function Stat({ label, value, icon }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{icon && <span>{icon} </span>}{label}</span>
      <strong style={{ fontSize: 14 }}>{value}</strong>
    </div>
  )
}
