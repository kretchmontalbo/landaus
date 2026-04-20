import SEO from '../components/SEO.jsx'

export default function PrivacyPage() {
  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 80px' }}>
      <SEO
        title="Privacy Policy"
        description="How LandAus collects, uses, stores, and protects your personal information under the Australian Privacy Act 1988."
        path="/privacy"
      />
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500,
        letterSpacing: '-0.02em', marginBottom: 8
      }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 40 }}>Last updated: April 2026</p>

      <div style={{ lineHeight: 1.75, color: 'var(--ink-soft)', fontSize: 16 }}>
        <Section title="What we collect">
          <p>When you use LandAus, we may collect:</p>
          <ul>
            <li>Your name, email address, and phone number</li>
            <li>Messages you send through our inquiry forms</li>
            <li>Property photos and listing information you upload</li>
            <li>Government-issued ID and property ownership documents (for verification)</li>
            <li>Profile information you provide (avatar, preferences, languages)</li>
            <li>Basic usage analytics to improve our service</li>
          </ul>
        </Section>

        <Section title="How we use your information">
          <p>We use your personal information <strong>only</strong> for:</p>
          <ul>
            <li>Verifying your identity to prevent rental scams</li>
            <li>Connecting you with landlords or tenants</li>
            <li>Improving platform safety</li>
            <li>Responding to your inquiries</li>
            <li>Legal compliance (tax records, lawful requests)</li>
          </ul>
          <p style={{ marginTop: 12 }}>We will <strong>never</strong>:</p>
          <ul>
            <li>Sell your personal data to third parties</li>
            <li>Use verification documents for marketing</li>
            <li>Share your data with advertisers</li>
            <li>Use your information for purposes you didn't consent to</li>
          </ul>
        </Section>

        <Section title="Data retention">
          <p>
            <strong>Verification documents</strong> (ID, passport, ownership proofs): stored in encrypted storage
            for the minimum time needed to verify your identity. Documents are automatically deleted
            <strong> 30 days after your verification is approved or rejected</strong>. We retain only the
            verification outcome (verified / not verified) for your account status.
          </p>
          <p>
            <strong>Account data</strong> (profile, listings, messages): retained while your account is active.
            If you request deletion, your data enters a <strong>30-day grace period</strong>, then is permanently
            removed. Some records — like inquiries sent or received — may be retained by the other party
            per their own privacy policies.
          </p>
          <p>
            <strong>Audit logs</strong>: admin actions on your data are logged for <strong>7 years</strong> for
            legal and regulatory compliance, then permanently deleted.
          </p>
        </Section>

        <Section title="Who we share with">
          <p>
            Only the property owner sees the details of inquiries submitted for their listing (name, email,
            phone, message). We may share data with:
          </p>
          <ul>
            <li>Our hosting and infrastructure providers (Supabase, Vercel) to deliver the service</li>
            <li>Law enforcement if required by Australian law</li>
          </ul>
        </Section>

        <Section title="Data breaches">
          <p>
            In the unlikely event of a data breach that is likely to cause serious harm to you, we will:
          </p>
          <ol>
            <li>Notify you within <strong>72 hours</strong> of discovery</li>
            <li>
              Notify the <strong>Office of the Australian Information Commissioner (OAIC)</strong> within 30 days
              as required by the Privacy Act 1988 (Notifiable Data Breaches Scheme)
            </li>
            <li>Provide clear details about what happened, what data was affected, and steps you can take</li>
          </ol>
        </Section>

        <Section title="Your rights under the Privacy Act 1988 (APPs)">
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access your data</strong> — Request a copy of everything we hold about you (we'll respond within 30 days)</li>
            <li><strong>Correct your data</strong> — Update any incorrect information via Account Settings</li>
            <li><strong>Delete your account</strong> — Request permanent deletion via Account Settings → Delete Account</li>
            <li><strong>Withdraw consent</strong> — Opt out of marketing communications at any time</li>
            <li>
              <strong>Lodge a complaint</strong> — Contact us first, then escalate to the OAIC at
              {' '}<a href="https://oaic.gov.au" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>oaic.gov.au</a>
              {' '}if unresolved
            </li>
          </ul>
          <p style={{ marginTop: 12 }}>
            To exercise these rights, email <a href="mailto:privacy@landaus.com.au" style={{ color: 'var(--accent)', fontWeight: 600 }}>privacy@landaus.com.au</a>
            {' '}or use the self-service options in your Account Settings.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            LandAus — operated by <strong>Kretchen Tanya Montalbo</strong><br />
            <strong>Address:</strong> 9 Bennelong Parkway, Wentworth Point, NSW 2127<br />
            <strong>Email:</strong> <a href="mailto:privacy@landaus.com.au" style={{ color: 'var(--accent)', fontWeight: 600 }}>privacy@landaus.com.au</a><br />
            <strong>Privacy officer:</strong> Kretchen Montalbo
          </p>
        </Section>
      </div>
    </section>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
        color: 'var(--ink)', marginBottom: 12, letterSpacing: '-0.01em'
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
