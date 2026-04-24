import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import { TiltCard } from '../components/TiltCard.jsx'

export default function ForLandlordsPage() {
  return (
    <>
      <SEO
        title="List your property — Reach Australia's newcomer community"
        description="Fill your vacancy faster with verified tenants that other platforms overlook. Free to list, no commissions. Built for Australian landlords who say yes first."
        path="/for-landlords"
      />
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
            maxWidth: 640, margin: '0 auto 32px'
          }}>
            Meet verified tenants the big platforms overlook.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <Link to="/list-property" className="btn btn-dark" style={{ padding: '14px 28px', fontSize: 15 }}>
              Get your first inquiry in 48 hours →
            </Link>
          </div>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </section>

      {/* 2. PAIN STRIP */}
      <section style={{
        background: '#0A2540', color: 'var(--white)', padding: '40px 24px 32px'
      }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24, textAlign: 'center'
        }}>
          <PainStat icon="⏱" label="Average Sydney vacancy" value="3–6 weeks" />
          <PainStat icon="💸" label="Lost rent per week vacant" value="$400–$800+" />
          <PainStat icon="👥" label="Qualified newcomers rejected by default" value="thousands / year" />
        </div>
        <p style={{
          textAlign: 'center', marginTop: 20,
          color: 'rgba(178, 252, 228, 0.9)', fontSize: 14, fontStyle: 'italic'
        }}>
          We're here to change that.
        </p>
      </section>

      {/* 3. HOOK */}
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

      {/* 4. Why list with LandAus */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 24px' }}>
        <h2 style={H2}>Why list with LandAus</h2>
        <div style={GRID_3}>
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

      {/* 5. How we reduce your risk */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '72px 24px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ ...H2, marginBottom: 8 }}>How we reduce your risk</h2>
          <p style={{ fontSize: 17, color: 'var(--ink-soft)', maxWidth: 640, margin: '0 auto', lineHeight: 1.55 }}>
            We get it — choosing a tenant feels like taking a bet. Here's how we stack the odds in your favour.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <RiskItem icon="🆔" title="ID-verified tenants">
            Every tenant uploads government ID before inquiring. No anonymous messages.
          </RiskItem>
          <RiskItem icon="💼" title="Income & employment proof">
            Employment letters and recent bank statements on tenant profiles — you see income before replying.
          </RiskItem>
          <RiskItem icon="🛂" title="Visa status transparency">
            Tenants declare their visa type and duration. Know how long they can legally stay.
          </RiskItem>
          <RiskItem icon="📞" title="Optional references">
            Request landlord or employer references before committing. Tenant's choice to share.
          </RiskItem>
          <RiskItem icon="🚨" title="Report button on every listing">
            Any dodgy behaviour? One click, admin action within 24 hours.
          </RiskItem>
        </div>
      </section>

      {/* 6. How it works */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={H2}>How it works</h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20
        }}>
          <HowStep n="1" title="Sign up">Create a free account with your email.</HowStep>
          <HowStep n="2" title="Get verified">Upload ID and proof of property. Approved within 24 hours.</HowStep>
          <HowStep n="3" title="Post your listing">Photos, details, rent, availability. Edit anytime.</HowStep>
          <HowStep n="4" title="Connect with tenants">Receive inquiries, reply directly, arrange inspections.</HowStep>
        </div>
      </section>

      {/* 7. Why be an early landlord (mint gradient) */}
      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft) 0%, var(--mint) 100%)',
        padding: '72px 24px 80px'
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ ...H2, marginBottom: 8 }}>Why join us now</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-soft)', maxWidth: 640, margin: '0 auto', lineHeight: 1.55 }}>
              We're hand-onboarding our first landlords personally. Here's what early adopters get — forever.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20
          }}>
            <EarlyPerk icon="🌟" title="Priority placement">
              First 20 landlords get top-of-search placement for any property they list — permanently.
            </EarlyPerk>
            <EarlyPerk icon="🆓" title="Free tier locked in">
              Our free forever tier is locked in for early landlords. When paid features launch, you keep yours free.
            </EarlyPerk>
            <EarlyPerk icon="🤝" title="Direct founder support">
              Talk directly to us. No chatbots, no ticket queues. Real humans solving real problems.
            </EarlyPerk>
            <EarlyPerk icon="📣" title="Shape the platform">
              Feature requests from early landlords go to the top of our roadmap. Help us build the platform you actually want.
            </EarlyPerk>
          </div>
        </div>
      </section>

      {/* 8. Built on trust */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 24px 48px' }}>
        <h2 style={H2}>Built on trust</h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20
        }}>
          <Trust icon="🔐" title="Bank-grade security">SSL encryption, Australian Privacy Principles compliant.</Trust>
          <Trust icon="🛡" title="ID-verified landlords">Every landlord verified within 24 hours, free forever.</Trust>
          <Trust icon="📊" title="Listing moderation">All listings reviewed for quality, reports actioned within 24 hours.</Trust>
          <Trust icon="🇦🇺" title="Australian hosted">Sydney region servers — your data stays in Australia.</Trust>
        </div>
      </section>

      {/* 9. FAQ */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ ...H2, marginBottom: 28 }}>Frequently asked questions</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          <Faq q="How much does it cost?" a="Listing is 100% free. We don't charge commissions, subscriptions, or take a cut of your rent. First 20 landlords have free-forever status locked in." />
          <Faq q="How does tenant verification work?" a="Tenants upload government ID, employment letters, and bank statements. You see their income and visa status when they inquire." />
          <Faq q="Can I reject inquiries?" a="Absolutely. You're always in control. Review the tenant's info and reply only to those you're interested in." />
          <Faq q="What if I have multiple properties?" a="List up to 3 properties free. Dedicated landlord accounts with more features are coming soon — and early landlords will be grandfathered in." />
          <Faq q="Is my data safe?" a="Yes. We use bank-grade encryption, row-level database security, and we never sell or share your data with third parties." />
          <Faq q="How do tenants contact me?" a="When a tenant inquires, you get an instant email with their details. From there, you contact them directly by email or phone — no LandAus middleman." />
          <Faq q="You're new — why trust you?" a="Fair question. We're a small Australian team building in public. No VC pressure, no aggressive growth targets, no shortcuts. We'd rather onboard 50 great landlords than 5,000 average ones. If something goes wrong, you talk directly to the founder." />
        </div>
      </section>

      {/* 10. FINAL CTA */}
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
            Get your first inquiry in 48 hours →
          </Link>
          <p style={{ fontSize: 14, color: 'rgba(178, 252, 228, 0.7)' }}>
            Questions? Email <a href="mailto:kretch.montalbo@gmail.com" style={{ color: 'var(--mint)', fontWeight: 600 }}>hello@landaus.com.au</a>
          </p>
        </div>
      </section>
    </>
  )
}

const H2 = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(28px, 4vw, 36px)',
  fontWeight: 600, letterSpacing: '-0.02em',
  marginBottom: 32, textAlign: 'center'
}

const GRID_3 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 20
}

function PainStat({ icon, label, value }) {
  return (
    <div>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
        color: 'var(--mint)', marginBottom: 2
      }}>{value}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{label}</div>
    </div>
  )
}

function Feature({ icon, title, children }) {
  return (
    <TiltCard maxTilt={6} style={{
      background: 'var(--mint-soft)', border: '1px solid var(--mint-deep)',
      borderRadius: 'var(--radius-lg)', padding: 28
    }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
        marginBottom: 8, letterSpacing: '-0.01em', color: 'var(--ink)'
      }}>{title}</h3>
      <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>{children}</p>
    </TiltCard>
  )
}

function RiskItem({ icon, title, children }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius)', padding: '18px 20px',
      display: 'flex', gap: 16, alignItems: 'flex-start'
    }}>
      <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{icon}</div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
          {title}
        </h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, lineHeight: 1.55 }}>{children}</p>
      </div>
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

function EarlyPerk({ icon, title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.7)', border: '1px solid var(--mint-deep)',
      borderRadius: 'var(--radius-lg)', padding: 24, backdropFilter: 'blur(6px)'
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
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
        borderRadius: 'var(--radius)', padding: '16px 20px'
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
      <p style={{ marginTop: 12, color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.65 }}>{a}</p>
    </details>
  )
}
