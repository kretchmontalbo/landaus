import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { getFeatureFlag } from '../lib/featureFlags.js'

export default function PricingPage() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistPlan, setWaitlistPlan] = useState(null)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    async function load() {
      const [flagRes, plansRes] = await Promise.all([
        getFeatureFlag('premium_subscriptions_enabled'),
        supabase.from('subscription_plans').select('*').order('price_monthly', { ascending: true })
      ])
      setEnabled(flagRes)
      setPlans(plansRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function joinWaitlist(e, planKey) {
    e.preventDefault()
    const email = user?.email || waitlistEmail
    if (!email) return
    await supabase.from('feature_waitlist').insert({
      user_id: user?.id || null,
      email,
      feature: `subscription_${planKey || 'pricing'}`,
      notes: `Plan: ${planKey || 'general interest'}`
    })
    setJoined(true)
    setWaitlistPlan(null)
    setTimeout(() => setJoined(false), 4000)
  }

  function handleSubscribe(plan) {
    // Not wired to Stripe yet
    console.log('[pricing] subscribe clicked', plan)
    alert('Payments coming soon. Thanks for your interest!')
  }

  return (
    <section className="section" style={{ maxWidth: 1100 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8
        }}>
          Simple pricing for landlords
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 17 }}>
          List for free. Upgrade when you want more visibility.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading plans…</div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <h3>Plans coming soon</h3>
          <p>We're finalising our pricing. Join the waitlist to be notified.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              enabled={enabled}
              onSubscribe={() => handleSubscribe(plan)}
              onJoinWaitlist={() => setWaitlistPlan(plan.key || plan.id)}
            />
          ))}
        </div>
      )}

      {!enabled && (
        <div style={{
          marginTop: 48, background: 'var(--mint-pale)', padding: 24,
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--mint-deep)',
          textAlign: 'center'
        }}>
          <strong style={{ color: 'var(--accent)' }}>⚡ Launching soon.</strong>{' '}
          <span style={{ color: 'var(--ink-soft)' }}>
            Premium plans are in the works. Basic listing is (and always will be) free.
          </span>
        </div>
      )}

      {waitlistPlan && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius-lg)',
            padding: 32, maxWidth: 420, width: '100%'
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
              Get notified when available
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20 }}>
              We'll email you the moment this plan goes live.
            </p>
            <form onSubmit={e => joinWaitlist(e, waitlistPlan)}>
              {!user && (
                <div className="form-field">
                  <label>Your email</label>
                  <input type="email" required value={waitlistEmail}
                    onChange={e => setWaitlistEmail(e.target.value)} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setWaitlistPlan(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-dark" style={{ padding: '10px 20px' }}>
                  Join waitlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {joined && <div className="toast">✓ You're on the waitlist!</div>}
    </section>
  )
}

function PlanCard({ plan, enabled, onSubscribe, onJoinWaitlist }) {
  const features = Array.isArray(plan.features) ? plan.features
    : typeof plan.features === 'string' ? plan.features.split(/\n/).filter(Boolean)
    : []
  const price = plan.price_monthly ?? plan.price ?? 0
  const highlighted = plan.is_popular || plan.highlighted

  return (
    <div style={{
      position: 'relative', background: 'var(--white)',
      border: highlighted ? '2px solid var(--accent)' : '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)', padding: 28, overflow: 'hidden'
    }}>
      {highlighted && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'var(--accent)', color: 'var(--mint)',
          padding: '4px 14px', fontSize: 11, fontWeight: 700,
          borderBottomLeftRadius: 10, letterSpacing: '0.04em'
        }}>MOST POPULAR</div>
      )}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
        {plan.name}
      </h3>
      {plan.description && (
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 16 }}>{plan.description}</p>
      )}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 700 }}>
          ${price}
        </span>
        <span style={{ color: 'var(--ink-muted)', fontSize: 14 }}>
          {price === 0 ? '' : ` / month`}
        </span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, fontSize: 14, lineHeight: 1.8 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--accent)' }}>✓</span>
            <span style={{ color: 'var(--ink-soft)' }}>{f}</span>
          </li>
        ))}
      </ul>

      {enabled ? (
        <button onClick={onSubscribe} className={highlighted ? 'btn btn-dark btn-block' : 'btn btn-ghost btn-block'}>
          Subscribe
        </button>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: '-12px', background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(1px)', zIndex: 1,
            display: 'grid', placeItems: 'center', borderRadius: 12
          }}>
            <span style={{
              background: 'var(--ink)', color: 'var(--mint)',
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700
            }}>COMING SOON</span>
          </div>
          <button onClick={onJoinWaitlist} className="btn btn-ghost btn-block">
            Get notified when available
          </button>
        </div>
      )}
    </div>
  )
}
