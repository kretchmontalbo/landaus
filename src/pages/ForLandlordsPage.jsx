import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForLandlordsPage() {
  return (
    <>
      {/* 1. HERO */}
      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft) 0%, var(--mint) 100%)',
        padding: '80px 24px 88px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 380, height: 380,
          background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
          <span className="eyebrow">For Landlords</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 56px)',
            fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.03em',
            color: 'var(--ink)', marginBottom: 18
          }}>
            Fill your vacancy <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 500 }}>faster.</em>
          </h1>
          <p style={{
            fontSize: 22, color: 'var(--ink-soft)', lineHeight: 1.45,
            maxWidth: 620, margin: '0 auto 32px'
          }}>
            Meet great tenants that other platforms overlook.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <Link to="/list-property" className="btn btn-dark" style={{ padding: '14px 28px', fontSize: 15 }}>
              List your first property free →
            </Link>
          </div>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </section>

      {/* 2. HOOK */}
      <section style={{
        background: 'var(--white)', padding: '72px 24px',
        maxWidth: 720, margin: '0 auto', textAlign: 'center'
      }}>
        <p style={{
          fontSize: 22, fontWeight: 600, color: 'var(--ink)',
          lineHeight: 1.45, marginBottom: 28,
          fontFamily: 'var(--font-display)', letterSpacing: '-0.01em'
        }}>
          Is your place sitting empty for months? Tired of good tenants being rejected for the wrong reasons?
        </p>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 20 }}>
          LandAus was built to fix a broken rental pattern — where properties stay vacant while capable,
          reliable tenants are overlooked just because they don't yet have an Australian rental history.
        </p>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 20 }}>
          We believe finding a home shouldn't depend on how long someone's been here — but on who they are.
        </p>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
          That's why we connect landlords with verified, ready-to-move tenants that other platforms miss.
        </p>
      </section>

      {/* 3. Why list with LandAus */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 32, textAlign: 'center'
        }}>
          Why list with LandAus
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20
        }}>
          <Feature icon="💰" title="Free to list">
            No commission fees, no subscription, no hidden charges. Your first listing is free, forever.
          </Feature>
          <Feature icon="⚡" title="Direct inquiries">
            Instant email notifications when tenants inquire. Their name, phone, email, and message — straight to your inbox.
          </Feature>
          <Feature icon="🎯" title="Pre-qualified tenants">
            Our users have stable jobs, good income, and proof of identity. They just don't have Australian rental history — yet.
          </Feature>
        </div>
      </section>

      {/* 4. How it works */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 24px 48px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 32, textAlign: 'center'
        }}>
          How it works
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20
        }}>
          <HowStep n="1" title="Sign up">Create a free account with your email.</HowStep>
          <HowStep n="2" title="Get verified">Upload ID and proof of property. Approved within 24 hours.</HowStep>
          <HowStep n="3" title="Post your listing">Photos, details, rent, availability. Edit anytime.</HowStep>
          <HowStep n="4" title="Connect with tenants">Receive inquiries, reply directly, arrange inspections.</HowStep>
        </div>
      </section>

      {/* 5. Built on trust */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 32, textAlign: 'center'
        }}>
          Built on trust
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20
        }}>
          <Trust icon="🔐" title="Bank-grade security">
            SSL encryption, Australian Privacy Principles compliant.
          </Trust>
          <Trust icon="🛡" title="ID-verified landlords">
            Every landlord verified within 24 hours, free forever.
          </Trust>
          <Trust icon="📊" title="Listing moderation">
            All listings reviewed for quality, reports actioned within 24 hours.
          </Trust>
          <Trust icon="🇦🇺" title="Australian hosted">
            Sydney region servers — your data stays in Australia.
          </Trust>
        </div>
      </section>

      {/* 6. FAQ */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '72px 24px 48px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 28, textAlign: 'center'
        }}>
          Frequently asked questions
        </h2>
        <div style={{ display: 'grid', gap: 10 }}>
          <Faq q="How much does it cost?" a="Listing is 100% free. We don't charge commissions, subscriptions, or take a cut of your rent." />
          <Faq q="How does tenant verification work?" a="Tenants can upload employment letters, bank statements, and ID to their profile. You see this info when they inquire, so you can evaluate them without asking." />
          <Faq q="Can I reject inquiries?" a="Absolutely. You're always in control. Review the tenant's info and reply only to those you're interested in." />
          <Faq q="What if I have multiple properties?" a="List up to 3 properties free. Dedicated landlord accounts with more features are coming soon." />
          <Faq q="Is my data safe?" a="Yes. We use bank-grade encryption, row-level database security, and we never sell or share your data with third parties." />
          <Faq q="How do tenants contact me?" a="When a tenant inquires, you get an instant email with their details. From there, you contact them directly by email or phone — no LandAus middleman." />
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section style={{
        background: '#0A2540', color: 'var(--white)',
        padding: '80px 24px 96px', textAlign: 'center', marginTop: 48
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 40px)',
            fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--white)', marginBottom: 14
          }}>
            Ready to fill your vacancy?
          </h2>
          <p style={{ fontSize: 18, color: 'var(--mint)', lineHeight: 1.6, marginBottom: 28 }}>
            It takes 5 minutes. Free forever. No credit card required.
          </p>
          <Link to="/list-property" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#B2FCE4', color: '#0A2540',
            padding: '16px 32px', borderRadius: 999,
            fontWeight: 700, fontSize: 16, marginBottom: 20
          }}>
            List your first property →
          </Link>
          <p style={{ fontSize: 14, color: 'rgba(178, 252, 228, 0.7)' }}>
            Questions? Email <a href="mailto:kretch.montalbo@gmail.com" style={{ color: 'var(--mint)', fontWeight: 600 }}>hello@landaus.com.au</a>
          </p>
        </div>
      </section>
    </>
  )
}

function Feature({ icon, title, children }) {
  return (
    <div style={{
      background: 'var(--mint-soft)', border: '1px solid var(--mint-deep)',
      borderRadius: 'var(--radius-lg)', padding: 28
    }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
        marginBottom: 8, letterSpacing: '-0.01em', color: 'var(--ink)'
      }}>{title}</h3>
      <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}

function HowStep({ n, title, children }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)', padding: 24
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--mint)', color: 'var(--accent)',
        display: 'grid', placeItems: 'center', fontWeight: 700,
        fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 14
      }}>{n}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}

function Trust({ icon, title, children }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius)', padding: 24,
      display: 'flex', gap: 16, alignItems: 'flex-start'
    }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>{icon}</div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
          {title}
        </h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.55 }}>{children}</p>
      </div>
    </div>
  )
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details
      open={open}
      onToggle={e => setOpen(e.currentTarget.open)}
      style={{
        background: 'var(--white)', border: '1px solid var(--line)',
        borderRadius: 'var(--radius)', padding: '16px 20px',
        transition: 'border-color 0.15s'
      }}
    >
      <summary style={{
        cursor: 'pointer', fontWeight: 600, color: 'var(--ink)',
        fontSize: 16, listStyle: 'none', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', gap: 16
      }}>
        <span>{q}</span>
        <span style={{
          color: 'var(--ink-muted)', fontSize: 20,
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
          transition: 'transform 0.2s'
        }}>+</span>
      </summary>
      <p style={{
        marginTop: 12, color: 'var(--ink-soft)',
        fontSize: 15, lineHeight: 1.65
      }}>{a}</p>
    </details>
  )
}
