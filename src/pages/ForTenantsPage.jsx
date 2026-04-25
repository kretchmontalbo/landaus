import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TiltCard } from '../components/TiltCard.jsx'
import IconBadge from '../components/IconBadge.jsx'
import { Send, BadgePercent, Languages, MapPin } from 'lucide-react'
import SEO from '../components/SEO.jsx'

export default function ForTenantsPage() {
  return (
    <>
      <SEO
        title="Find welcoming rentals in Australia"
        description="Tired of being rejected for lack of rental history? LandAus connects newcomers with landlords who welcome immigrants, students, and visa holders."
        path="/for-tenants"
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
          <span className="eyebrow">For Tenants</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 56px)',
            fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.03em',
            color: 'var(--ink)', marginBottom: 18
          }}>
            Tired of being <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 500 }}>rejected</em> before you even speak?
          </h1>
          <p style={{
            fontSize: 22, color: 'var(--ink-soft)', lineHeight: 1.45,
            maxWidth: 640, margin: '0 auto 32px'
          }}>
            Australia's first rental platform built for tenants without local rental history.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <Link to="/search" className="btn btn-dark" style={{ padding: '14px 28px', fontSize: 15 }}>
              Start browsing homes →
            </Link>
            <Link to="/affordability" className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: 15, background: 'var(--white)' }}>
              Calculate what I can afford →
            </Link>
          </div>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create free account</Link>
          </p>
        </div>
      </section>

      {/* 2. PAIN VALIDATION */}
      <section style={{
        background: 'var(--white)', padding: '72px 24px',
        maxWidth: 720, margin: '0 auto', textAlign: 'center'
      }}>
        <p style={{
          fontSize: 22, fontWeight: 600, color: 'var(--ink)',
          lineHeight: 1.45, marginBottom: 28,
          fontFamily: 'var(--font-display)', letterSpacing: '-0.01em'
        }}>
          You have the job. You have the income. You have the proof you're a responsible adult.
          And yet — rejected. Again.
        </p>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 20 }}>
          It's the unspoken rule nobody warned you about: in Australia, landlords want to see rental history.
          If you're new here — a student, a skilled migrant, a visa holder, a first-time renter — you don't
          have any yet. And most agents won't even read your application.
        </p>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
          We get it. We built LandAus for you.
        </p>
      </section>

      {/* 3. How LandAus helps */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 24px' }}>
        <h2 style={H2}>How LandAus helps</h2>
        <div style={GRID_4}>
          <Card icon={Send} title="Apply directly to landlords">
            Skip agent filters. Every landlord here has agreed to welcome newcomers. Your message goes straight to them.
          </Card>
          <Card icon={BadgePercent} title="100% free, always">
            No application fees. No subscription. No holding deposits. Browsing, applying, and inquiring is always free for tenants.
          </Card>
          <Card icon={Languages} title="Language-matched households">
            Landlords list the languages spoken in the home. Filter to find a household that speaks Tagalog, Mandarin, Hindi, Arabic, or your native tongue.
          </Card>
          <Card icon={MapPin} title="Newcomer-friendly suburbs">
            We write honest suburb guides with what matters: transport, Halal/Asian grocery proximity, community, safety. No real estate fluff.
          </Card>
        </div>
      </section>

      {/* 4. How it works */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 24px 48px' }}>
        <h2 style={H2}>How it works</h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20
        }}>
          <HowStep n="1" title="Create your profile">
            Upload employment letter, bank statements, and visa docs. Landlords see this when you inquire.
          </HowStep>
          <HowStep n="2" title="Browse homes">
            Filter by suburb, budget, and language. Every listing welcomes newcomers.
          </HowStep>
          <HowStep n="3" title="Inquire directly">
            Send your profile + a personal message. No agent gatekeepers.
          </HowStep>
          <HowStep n="4" title="Connect with landlord">
            Hear back directly. Arrange inspection. Sign lease.
          </HowStep>
        </div>
      </section>

      {/* 5. What makes LandAus different */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ ...H2, textAlign: 'left', marginBottom: 18 }}>We see what other platforms don't</h2>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 18 }}>
          Big rental sites are built for landlords who already have plenty of applicants. They can afford
          to filter out anyone who looks different.
        </p>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 18 }}>
          LandAus is built the other way around. Every landlord who joins has committed to one thing:{' '}
          <strong style={{ color: 'var(--ink)' }}>
            judging tenants on who they are, not how long they've been here.
          </strong>
        </p>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
          That's not marketing. That's our core filter for accepting landlords.
        </p>
      </section>

      {/* 6. REAL TALK */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{
          background: 'var(--mint-soft)', border: '1px solid var(--mint-deep)',
          borderRadius: 'var(--radius-lg)', padding: '32px 28px'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600,
            letterSpacing: '-0.01em', marginBottom: 16, color: 'var(--ink)'
          }}>
            We're new. Here's what that means for you.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 16 }}>
            LandAus just launched. We're onboarding our first landlords one by one — each hand-verified. That means:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16, fontSize: 16, lineHeight: 1.8 }}>
            <li style={{ display: 'flex', gap: 10, color: 'var(--ink)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>
              Every listing is high-quality and from a real landlord we've spoken to
            </li>
            <li style={{ display: 'flex', gap: 10, color: 'var(--ink)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>
              You might not find your dream home here today — but you will help build the platform that changes things
            </li>
            <li style={{ display: 'flex', gap: 10, color: 'var(--ink)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>
              Your feedback directly shapes what we build next
            </li>
          </ul>
          <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.7, fontWeight: 500 }}>
            Be early. Be seen. Be part of something that didn't exist last month.
          </p>
        </div>
      </section>

      {/* 7. FAQ */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ ...H2, marginBottom: 28 }}>Frequently asked questions</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          <Faq q="Do I really need rental history to rent in Australia?" a="Most traditional agents require it — which leaves thousands of newcomers out. LandAus was built specifically because that's broken." />
          <Faq q="What documents should I upload?" a="Employment letter, last 2 months of bank statements, government ID, visa document (if applicable). Optional but recommended: reference letter from a past landlord or employer." />
          <Faq q="Is this really free for tenants?" a="Yes. Forever. We charge landlords nothing to list and tenants nothing to apply. We'll eventually add optional paid features for landlords, but tenants will always be free." />
          <Faq q="What areas do you cover?" a="All Australian states and territories. Most listings are currently in NSW and VIC, but we're growing fast." />
          <Faq q="What if a landlord ignores me?" a="It happens. Reply to 5–10 listings instead of 1. Also — if a landlord on LandAus is ignoring inquiries, report them. We hold our landlords to a response standard." />
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section style={{
        background: '#0A2540', color: 'var(--white)',
        padding: '80px 24px 96px', textAlign: 'center', marginTop: 48
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 40px)',
            fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--white)', marginBottom: 14
          }}>
            Stop being overlooked. Start being seen.
          </h2>
          <p style={{ fontSize: 18, color: 'var(--mint)', lineHeight: 1.6, marginBottom: 28 }}>
            Create your free profile. Find landlords who welcome you.
          </p>
          <Link to="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#B2FCE4', color: '#0A2540',
            padding: '16px 32px', borderRadius: 999,
            fontWeight: 700, fontSize: 16, marginBottom: 20
          }}>
            Create free account →
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

const GRID_4 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 20
}

function Card({ icon, title, children }) {
  return (
    <TiltCard maxTilt={6} style={{
      background: 'var(--mint-soft)', border: '1px solid var(--mint-deep)',
      borderRadius: 'var(--radius-lg)', padding: 24
    }}>
      <IconBadge icon={icon} />
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
        marginBottom: 8, letterSpacing: '-0.01em', color: 'var(--ink)'
      }}>{title}</h3>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, lineHeight: 1.6 }}>{children}</p>
    </TiltCard>
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
