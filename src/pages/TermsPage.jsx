export default function TermsPage() {
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 80px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Terms of Service
      </h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 40 }}>Last updated: April 2026</p>

      <div style={{ lineHeight: 1.8, color: 'var(--ink-soft)', fontSize: 15 }}>
        <Section title="What LandAus is">
          <p>
            LandAus is an online marketplace that connects property owners (landlords) with prospective tenants,
            with a focus on welcoming newcomers to Australia. We do not own, manage, or inspect any properties listed
            on the platform. We are a connector, not a party to any rental agreement.
          </p>
        </Section>

        <Section title="Our anti-discrimination commitment">
          <p>
            At the core of LandAus is the belief that everyone deserves fair access to housing. Listings and interactions
            on our platform must not discriminate based on race, ethnicity, religion, visa status, sexuality, gender identity,
            disability, or any other protected characteristic under Australian law.
          </p>
        </Section>

        <Section title="Prohibited content">
          <ul>
            <li>Fraudulent, misleading, or illegal listings</li>
            <li>Listings for properties you do not own or have authority to rent</li>
            <li>Discriminatory language or requirements</li>
            <li>Spam, phishing, or malicious content</li>
          </ul>
        </Section>

        <Section title="Content moderation">
          <p>
            We reserve the right to remove any content and suspend or terminate accounts that violate these terms.
            First-time listings undergo review before going live. We aim to review listings within 24 hours.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            LandAus is not liable for disputes between landlords and tenants. We do not verify the accuracy of listings,
            conduct background checks, or guarantee the condition of properties. Users should exercise their own due diligence.
          </p>
        </Section>

        <Section title="Eligibility">
          <p>You must be at least 18 years of age to use LandAus.</p>
        </Section>

        <Section title="Governing law">
          <p>
            These terms are governed by the laws of New South Wales, Australia. Any disputes will be subject to the
            exclusive jurisdiction of the courts of New South Wales.
          </p>
        </Section>
      </div>
    </section>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
