import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const TIERS = [
  { key: '7d', days: 7, price: 29, label: '7 days', save: null, highlight: false },
  { key: '14d', days: 14, price: 49, label: '14 days', save: 'save $9', highlight: true },
  { key: '30d', days: 30, price: 89, label: '30 days', save: 'save $20', highlight: false }
]

export default function FeatureBoostModal({ property, onClose }) {
  const { user } = useAuth()
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSelect(tier) {
    setSelected(tier)
    try {
      await supabase.from('feature_waitlist').insert({
        user_id: user?.id || null,
        email: user?.email || 'unknown',
        feature: 'featured_listings_interest',
        notes: `Property: ${property?.id} · Tier: ${tier.label} ($${tier.price}) · ${tier.days} days`
      })
    } catch {}
    setSubmitted(true)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10, 37, 64, 0.55)',
        display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          padding: 32, maxWidth: 560, width: '100%', boxShadow: 'var(--shadow-lg)',
          maxHeight: '92vh', overflowY: 'auto'
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🌟</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
              Thanks! You're on the list.
            </h3>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 16 }}>
              Payments launching soon! We'll email you when featured listings go live.
            </p>
            <div style={{
              background: 'var(--mint-soft)', border: '1px solid var(--mint-deep)',
              borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left'
            }}>
              <strong style={{ color: 'var(--accent)', fontSize: 14 }}>Meanwhile, early-landlord perk 🎁</strong>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.6 }}>
                We're manually boosting listings for our first 20 landlords — <strong>free</strong>.
                Reply to <a href="mailto:kretch.montalbo@gmail.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>hello@landaus.com.au</a> to claim.
              </p>
            </div>
            <button onClick={onClose} className="btn btn-dark btn-block">Got it</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 4 }}>
                  ✨ Feature this listing
                </h3>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
                  Pin to the top of search, add a gold badge, and get 3× more views.
                </p>
              </div>
              <button onClick={onClose} aria-label="Close"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--ink-muted)', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              {TIERS.map(t => (
                <button
                  key={t.key}
                  onClick={() => handleSelect(t)}
                  disabled={selected !== null}
                  style={{
                    background: t.highlight ? 'var(--mint-soft)' : 'var(--white)',
                    border: `2px solid ${t.highlight ? 'var(--accent)' : 'var(--line)'}`,
                    borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    textAlign: 'left', transition: 'transform 0.15s, border-color 0.15s'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {t.label}
                      {t.save && (
                        <span style={{
                          background: 'var(--accent)', color: 'var(--mint)',
                          fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                          letterSpacing: '0.04em', textTransform: 'uppercase'
                        }}>{t.save}</span>
                      )}
                      {t.highlight && (
                        <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>⭐ most popular</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>
                      Pinned + gold badge for {t.days} days
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 28, color: 'var(--ink)'
                  }}>
                    ${t.price}
                    <span style={{ fontSize: 13, color: 'var(--ink-muted)', fontWeight: 400, marginLeft: 4 }}>AUD</span>
                  </div>
                </button>
              ))}
            </div>

            <p style={{ fontSize: 12, color: 'var(--ink-muted)', textAlign: 'center' }}>
              Payments launching soon — selecting a tier adds you to the waitlist.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
