import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 80px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 600,
        letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 32
      }}>
        Find home,<br />not <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>rejection.</em>
      </h1>

      <div style={{ lineHeight: 1.8, color: 'var(--ink-soft)', fontSize: 17 }}>
        <p style={{ marginBottom: 24 }}>
          Moving to Australia is exciting — until you try to rent. Newcomers face a brutal catch-22:
          you can't get a rental without local references, and you can't get references without a rental.
          Applications get rejected for "lack of rental history." Real estate agents prioritise locals.
          The system wasn't built for people starting fresh.
        </p>

        <p style={{ marginBottom: 24 }}>
          LandAus exists to change that. Every listing on our platform comes from a landlord who
          <strong> welcomes newcomers first</strong> — immigrants, international students, skilled visa holders,
          anyone building a new life in Australia. No rental history? No worries. We connect you directly
          with landlords who understand that a visa stamp and a job offer should be enough.
        </p>

        <p style={{ marginBottom: 40 }}>
          Built in Sydney in 2026 by people who know the struggle firsthand. Because finding home
          shouldn't mean proving you belong.
        </p>

        <Link to="/search" className="btn btn-dark" style={{ padding: '14px 28px', fontSize: 16 }}>
          Browse listings →
        </Link>
      </div>
    </section>
  )
}
