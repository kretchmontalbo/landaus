export default function PrivacyPage() {
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 80px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 40 }}>Last updated: April 2026</p>

      <div style={{ lineHeight: 1.8, color: 'var(--ink-soft)', fontSize: 15 }}>
        <Section title="What we collect">
          <p>When you use LandAus, we may collect:</p>
          <ul>
            <li>Your name, email address, and phone number</li>
            <li>Messages you send through our inquiry forms</li>
            <li>Property photos and listing information you upload</li>
            <li>Profile information you provide (avatar, preferences)</li>
            <li>Basic usage data to improve our service</li>
          </ul>
        </Section>

        <Section title="How we use it">
          <ul>
            <li>To facilitate rental connections between landlords and tenants</li>
            <li>To display your listings to prospective tenants</li>
            <li>To deliver inquiry messages to property owners</li>
            <li>To send you notifications about your listings and inquiries</li>
            <li>To moderate content and ensure platform safety</li>
          </ul>
        </Section>

        <Section title="Who we share with">
          <p>
            Only the property owner sees the details of inquiries submitted for their listing (name, email, phone, message).
            We <strong>never sell your personal information</strong> to third parties. We may share data with:
          </p>
          <ul>
            <li>Our hosting and infrastructure providers (Supabase, Vercel) for service delivery</li>
            <li>Law enforcement if required by Australian law</li>
          </ul>
        </Section>

        <Section title="Your rights under Australian Privacy Principles">
          <p>Under the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs), you have the right to:</p>
          <ul>
            <li><strong>Access</strong> your data — use the "Download all my data" feature in Account Settings</li>
            <li><strong>Correct</strong> your data — edit your profile and listings at any time</li>
            <li><strong>Delete</strong> your data — use the "Delete my account" feature for complete erasure</li>
            <li><strong>Complain</strong> — if you believe we've mishandled your data, you can lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at <em>oaic.gov.au</em></li>
          </ul>
        </Section>

        <Section title="Contact us">
          <p>For privacy-related inquiries, email us at <strong>privacy@landaus.com.au</strong>.</p>
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
