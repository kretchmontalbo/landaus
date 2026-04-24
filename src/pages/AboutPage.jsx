import { Link } from 'react-router-dom'
import { TiltCard } from '../components/TiltCard.jsx'

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft) 0%, var(--mint) 100%)',
        padding: '64px 24px 72px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <span className="eyebrow">About LandAus</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.03em',
            color: 'var(--ink)', marginBottom: 18
          }}>
            Find home, not <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 500 }}>rejection.</em>
          </h1>
          <p style={{
            fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.55,
            maxWidth: 580, margin: '0 auto'
          }}>
            Australia's rental portal for the people traditional platforms overlook.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600,
          letterSpacing: '-0.02em', marginBottom: 14
        }}>
          Our mission
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
          LandAus exists because finding a rental in Australia shouldn't depend on a local rental history
          you haven't had time to build. We connect immigrants, international students, visa holders, and
          first-time renters with landlords who welcome them — no rejection, no chasing, no bias.
        </p>
      </section>

      {/* What we believe */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600,
          letterSpacing: '-0.02em', marginBottom: 32, textAlign: 'center'
        }}>
          What we believe
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24
        }}>
          <Belief icon="🌟" title="Every tenant deserves a chance">
            Employment letters, bank statements, and visa documents are proof of responsibility — not rental history.
          </Belief>
          <Belief icon="🛡" title="Verified landlords, always">
            Every landlord on LandAus is ID-verified. Every listing is from an owner who said yes to newcomers upfront.
          </Belief>
          <Belief icon="💰" title="Tenants never pay fees">
            Searching, applying, and inquiring is always 100% free for tenants. We think it should be that way everywhere.
          </Belief>
          <Belief icon="🌏" title="Cultural community awareness">
            Our map surfaces Filipino grocers, halal food, Asian supermarkets, migrant support — the community infrastructure that makes a suburb feel like home.
          </Belief>
          <Belief icon="🗣" title="Language-matched households">
            Landlords list which languages they speak at home. Tenants can filter. We don't translate for you — we help you find a household where you already belong.
          </Belief>
          <Belief icon="🏳️‍🌈" title="Inclusivity as a filter, not a slogan">
            LGBTQIA+ friendly, women-safe, disability-accessible — filters that mean something because landlords opt in deliberately.
          </Belief>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600,
          letterSpacing: '-0.02em', marginBottom: 24
        }}>
          How LandAus works
        </h2>
        <div style={{ display: 'grid', gap: 16 }}>
          <Step n="1" text={<>Landlords list their properties with a <strong>"yes-first" policy</strong></>} />
          <Step n="2" text={<>Tenants browse, filter by suburb and language, and inquire</>} />
          <Step n="3" text={<>Landlord and tenant connect directly — <strong>no middlemen, no commissions</strong></>} />
        </div>
      </section>

      {/* Who's behind */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600,
          letterSpacing: '-0.02em', marginBottom: 14
        }}>
          Built in Sydney
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink-soft)', marginBottom: 20 }}>
          LandAus is built by people who understand the newcomer experience firsthand. Our founder spent
          years in Australian property management at Fulton Lane Realty, watching qualified tenants get
          turned away over a missing piece of paper. LandAus is our answer.
        </p>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
          Made with 💚 in Sydney · Proudly built for the global community
        </p>
      </section>

      {/* Landlord callout */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          background: 'var(--mint-soft)',
          border: '1px solid var(--mint)',
          borderRadius: '12px',
          padding: '24px',
          margin: '32px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)' }}>
              👋 Are you a landlord?
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: '14px' }}>
              We built this especially for you too. See how LandAus fills your vacancies faster.
            </p>
          </div>
          <Link to="/for-landlords" className="btn btn-dark" style={{ flexShrink: 0 }}>
            Learn more →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, var(--mint-soft) 0%, var(--mint) 100%)',
        padding: '72px 24px 88px', textAlign: 'center', marginTop: 48
      }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 42px)',
            fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 14
          }}>
            Join the movement
          </h2>
          <p style={{
            fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 28
          }}>
            Whether you're looking for a home or have one to offer — be part of building a fairer rental market.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/list-property" className="btn btn-dark" style={{ padding: '14px 28px', fontSize: 15 }}>
              List a property
            </Link>
            <Link to="/search" className="btn btn-ghost" style={{
              padding: '14px 28px', fontSize: 15, background: 'var(--white)', borderColor: 'var(--white)'
            }}>
              Browse homes
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function Belief({ icon, title, children }) {
  return (
    <TiltCard maxTilt={6} style={{
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)', padding: 28
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: 'var(--mint)',
        display: 'grid', placeItems: 'center', fontSize: 26, marginBottom: 16
      }}>{icon}</div>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
        marginBottom: 8, letterSpacing: '-0.01em'
      }}>{title}</h3>
      <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>{children}</p>
    </TiltCard>
  )
}

function Step({ n, text }) {
  return (
    <div style={{
      display: 'flex', gap: 18, alignItems: 'center',
      background: 'var(--white)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius)', padding: '18px 20px'
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--mint)', color: 'var(--accent)',
        display: 'grid', placeItems: 'center', fontWeight: 700,
        fontFamily: 'var(--font-display)', fontSize: 18, flexShrink: 0
      }}>{n}</div>
      <span style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}
