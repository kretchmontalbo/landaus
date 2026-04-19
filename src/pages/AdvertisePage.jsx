import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { isValidEmail } from '../lib/validation.js'

const TIERS = [
  { key: 'starter', name: 'Starter', price: 49, duration: '7 days', features: ['Sidebar placement', '1,000 est. impressions', 'Standard category targeting'] },
  { key: 'standard', name: 'Standard', price: 149, duration: '30 days', popular: true, features: ['Sidebar + footer placement', '5,000 est. impressions', 'Standard category targeting', 'Monthly performance report'] },
  { key: 'premium', name: 'Premium', price: 299, duration: '30 days', features: ['All placements + homepage', '15,000 est. impressions', 'Featured badge', 'Priority support', 'Monthly performance report'] }
]

const CATEGORIES = [
  'Moving & relocation',
  'Migration & visa services',
  'Banking & finance',
  'Furniture & homewares',
  'Telecom & internet',
  'Cleaning & home services',
  'Insurance',
  'Legal services',
  'Education & tutoring',
  'Other'
]

export default function AdvertisePage() {
  const [form, setForm] = useState({
    business_name: '', category: '', contact_email: '', tier: 'standard', message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!isValidEmail(form.contact_email)) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    const { error: insertErr } = await supabase.from('business_ads').insert({
      business_name: form.business_name,
      category: form.category,
      contact_email: form.contact_email,
      preferred_tier: form.tier,
      message: form.message,
      status: 'pending_review'
    })
    setSubmitting(false)
    if (insertErr) {
      setError('Something went wrong. Please try again or email hello@landaus.com.au')
    } else {
      setSuccess(true)
    }
  }

  return (
    <>
      {/* 1. HERO */}
      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft) 0%, var(--mint) 100%)',
        padding: '80px 24px 88px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <span className="eyebrow">For Businesses</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 56px)',
            fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.03em',
            color: 'var(--ink)', marginBottom: 18
          }}>
            Reach Australia's <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 500 }}>newcomer</em> community.
          </h1>
          <p style={{ fontSize: 22, color: 'var(--ink-soft)', lineHeight: 1.45, maxWidth: 640, margin: '0 auto' }}>
            Your business in front of thousands of new Australians setting up their lives.
          </p>
        </div>
      </section>

      {/* 2. Who uses LandAus */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 24px 24px' }}>
        <h2 style={H2}>Who uses LandAus</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          <AudienceCard icon="🛂" label="Visa type" value="Student, skilled, PR" />
          <AudienceCard icon="🌏" label="Countries of origin" value="Coming soon" />
          <AudienceCard icon="💼" label="Intent" value="Setting up a new life" />
          <AudienceCard icon="📍" label="Cities" value="Sydney · Melbourne · Brisbane +" />
        </div>
      </section>

      {/* 3. Pricing tiers */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 24px 24px' }}>
        <h2 style={H2}>Pricing</h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20
        }}>
          {TIERS.map(t => (
            <div key={t.key} style={{
              position: 'relative',
              background: 'var(--white)',
              border: t.popular ? '2px solid var(--accent)' : '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)', padding: 28
            }}>
              {t.popular && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--accent)', color: 'var(--mint)',
                  padding: '4px 14px', fontSize: 11, fontWeight: 700,
                  borderBottomLeftRadius: 10, letterSpacing: '0.04em'
                }}>MOST POPULAR</div>
              )}
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
                {t.name}
              </h3>
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 700 }}>${t.price}</span>
                <span style={{ color: 'var(--ink-muted)', fontSize: 14 }}> / {t.duration}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20, fontSize: 14, lineHeight: 1.8 }}>
                {t.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--accent)' }}>✓</span>
                    <span style={{ color: 'var(--ink-soft)' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#contact" className={t.popular ? 'btn btn-dark btn-block' : 'btn btn-ghost btn-block'}>
                Get started
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Example placements */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 24px' }}>
        <h2 style={H2}>Example placements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <Placement title="Search sidebar" detail="Visible to every tenant browsing rentals — high-intent audience." />
          <Placement title="Between property cards" detail="Native placement appears every 8 listings in the search grid." />
          <Placement title="Homepage footer" detail="One ad above the site footer — seen by every visitor to LandAus." />
        </div>
      </section>

      {/* 5. FAQ */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ ...H2, marginBottom: 28 }}>Frequently asked questions</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          <Faq q="Who approves ads?" a="Every submission is reviewed by our team within 48 hours. We only accept businesses that genuinely help newcomers settle in Australia." />
          <Faq q="Can I target specific states?" a="Yes. All tiers allow state-level targeting (e.g. NSW only, VIC only). Premium tier unlocks suburb-level targeting." />
          <Faq q="What formats do you accept?" a="A short headline (≤60 chars), a one-line description (≤140 chars), optional image (1200×628px recommended), and a landing URL." />
          <Faq q="Payment options?" a="Invoice or card. We send an invoice after approval — payment is due before the campaign goes live." />
        </div>
      </section>

      {/* 6. Contact form */}
      <section id="contact" style={{ maxWidth: 620, margin: '0 auto', padding: '48px 24px 88px' }}>
        <h2 style={{ ...H2, marginBottom: 12 }}>Get in touch to advertise</h2>
        <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 16, marginBottom: 28 }}>
          Tell us about your business. We'll reply within 48 hours.
        </p>

        {success ? (
          <div style={{
            background: 'var(--mint-soft)', border: '1px solid var(--mint-deep)',
            padding: 32, borderRadius: 'var(--radius-lg)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>✓</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent)', marginBottom: 8 }}>
              Submission received
            </h3>
            <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              We'll review and reply within 48 hours. Questions? Email <a href="mailto:kretch.montalbo@gmail.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>hello@landaus.com.au</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: 'var(--white)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)', padding: 28
          }}>
            <div className="form-field">
              <label>Business name *</label>
              <input type="text" required value={form.business_name}
                onChange={e => setForm({ ...form, business_name: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Category *</label>
              <select required value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Contact email *</label>
              <input type="email" required value={form.contact_email}
                onChange={e => setForm({ ...form, contact_email: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Preferred tier</label>
              <select value={form.tier}
                onChange={e => setForm({ ...form, tier: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                {TIERS.map(t => <option key={t.key} value={t.key}>{t.name} — ${t.price} / {t.duration}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Message</label>
              <textarea rows={4} placeholder="Tell us about your business and audience..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', color: '#991B1B', padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-dark btn-block" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Send my submission →'}
            </button>
          </form>
        )}
      </section>
    </>
  )
}

const H2 = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(28px, 4vw, 36px)',
  fontWeight: 600, letterSpacing: '-0.02em',
  marginBottom: 28, textAlign: 'center'
}

function AudienceCard({ icon, label, value }) {
  return (
    <div style={{
      background: 'var(--mint-soft)', border: '1px solid var(--mint-deep)',
      borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center'
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginTop: 4 }}>
        {value}
      </div>
    </div>
  )
}

function Placement({ title, detail }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)', padding: 24
    }}>
      <div style={{
        background: 'var(--mint-pale)', borderRadius: 10, aspectRatio: '16/9',
        display: 'grid', placeItems: 'center', color: 'var(--ink-muted)',
        fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14
      }}>
        Sponsored preview
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>{detail}</p>
    </div>
  )
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={e => setOpen(e.currentTarget.open)} style={{
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius)', padding: '16px 20px'
    }}>
      <summary style={{
        cursor: 'pointer', fontWeight: 600, color: 'var(--ink)', fontSize: 16,
        listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16
      }}>
        <span>{q}</span>
        <span style={{ color: 'var(--ink-muted)', fontSize: 20, transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>+</span>
      </summary>
      <p style={{ marginTop: 12, color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.65 }}>{a}</p>
    </details>
  )
}
