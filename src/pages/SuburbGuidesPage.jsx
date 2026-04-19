import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import ModeTabs from '../components/ModeTabs.jsx'

export default function SuburbGuidesPage() {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('suburb_guides').select('*').order('suburb').then(({ data }) => {
      setGuides(data || [])
      setLoading(false)
    })
  }, [])

  const byState = guides.reduce((acc, g) => {
    (acc[g.state] = acc[g.state] || []).push(g)
    return acc
  }, {})

  return (
    <>
      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft), var(--mint))',
        padding: '48px 20px 48px', textAlign: 'center'
      }}>
        <div style={{ marginBottom: 24 }}>
          <ModeTabs activeTab="suburbs" />
        </div>
        <span className="eyebrow">🧭 Written for newcomers, by people who get it</span>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 600, letterSpacing: '-0.02em', margin: '16px auto 12px', maxWidth: 720
        }}>
          Which suburb is <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>right for you?</em>
        </h1>
        <p style={{ color: 'var(--ink-soft)', maxWidth: 600, margin: '0 auto', fontSize: 17 }}>
          Honest guides covering transport, safety, community, halal & Asian grocery access, and what it's actually like to live there.
        </p>
      </section>

      <section className="section">
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>Loading…</div>
        ) : (
          Object.entries(byState).map(([state, stateGuides]) => (
            <div key={state} style={{ marginBottom: 48 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600,
                letterSpacing: '-0.02em', marginBottom: 16
              }}>{state}</h2>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16
              }}>
                {stateGuides.map(g => (
                  <Link key={g.id} to={`/suburbs/${g.suburb.toLowerCase().replace(/\s+/g, '-')}-${g.state.toLowerCase()}`}
                    style={{
                      background: 'var(--white)', border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-lg)', padding: 24,
                      transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
                      {g.suburb}
                    </h3>
                    <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 12 }}>
                      {g.state} · {g.postcode}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 14 }}>
                      {g.overview}
                    </p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-muted)' }}>
                      <span>🛡 {g.safety_rating}/5</span>
                      <span>👨‍👩‍👧 {g.family_friendly_rating}/5</span>
                      <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 600 }}>
                        ~${g.average_rent}/wk
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  )
}
