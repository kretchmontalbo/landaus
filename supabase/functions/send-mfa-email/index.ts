// Supabase Edge Function: send-mfa-email
// Generates a 6-digit MFA code via the DB RPC (which also stores the hash),
// then emails the plaintext code to the authenticated user via Resend.
//
// Deploy: supabase functions deploy send-mfa-email
// Secrets required (Supabase dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY  — Resend API key (re_...)
//   MFA_FROM_EMAIL  — From address, e.g. "LandAus <security@landaus.com.au>"
//
// The caller must have a valid Supabase session; we forward their Authorization
// header to Postgres so the RPC runs as `auth.uid()`.

// deno-lint-ignore-file
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ success: false, error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ success: false, error: 'not_authenticated' }, 401)
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const FROM = Deno.env.get('MFA_FROM_EMAIL') || 'LandAus <security@landaus.com.au>'

  if (!RESEND_API_KEY) return json({ success: false, error: 'resend_not_configured' }, 500)

  // Client bound to the caller's JWT so the RPC runs as auth.uid()
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  // Need the authed user's email for the outbound message
  const { data: userData, error: userErr } = await sb.auth.getUser()
  if (userErr || !userData?.user) {
    return json({ success: false, error: 'not_authenticated' }, 401)
  }
  const toEmail = userData.user.email
  if (!toEmail) return json({ success: false, error: 'no_email_on_account' }, 400)

  // Generate a code via the hardened DB RPC. Errors come back as PG errors.
  const { data: genData, error: genErr } = await sb.rpc('generate_email_mfa_code')
  if (genErr) {
    const msg = genErr.message || ''
    if (/rate|too many|limit/i.test(msg)) {
      return json({ success: false, error: 'rate_limited', message: 'Too many code requests. Please try again in an hour.' }, 429)
    }
    return json({ success: false, error: 'rpc_failed', message: msg }, 500)
  }
  const code = genData?.code
  const expiresIn = genData?.expires_in_minutes ?? 10
  if (!code) return json({ success: false, error: 'no_code' }, 500)

  // Render email
  const subject = `Your LandAus verification code: ${code}`
  const text = `Your LandAus verification code is ${code}.\nIt expires in ${expiresIn} minutes.\n\nIf you didn't try to sign in, you can ignore this email — your account is safe.`
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAFBFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0A2540;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" style="max-width:480px;background:#FFFFFF;border:1px solid #E3E8EE;border-radius:20px;overflow:hidden;">
          <tr><td style="padding:28px 32px 8px 32px;">
            <div style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#0A2540;letter-spacing:-0.02em;">
              🏡 LandAus
            </div>
          </td></tr>
          <tr><td style="padding:8px 32px 32px 32px;">
            <h1 style="margin:16px 0 10px;font-size:20px;font-weight:600;color:#0A2540;">Your verification code</h1>
            <p style="margin:0 0 20px;color:#3D4E66;font-size:15px;line-height:1.6;">
              Enter this code to finish signing in:
            </p>
            <div style="background:#E6FDF5;border:1px solid #8FE9CC;border-radius:14px;padding:22px;text-align:center;margin-bottom:20px;">
              <div style="font-family:ui-monospace,Menlo,monospace;font-size:34px;font-weight:700;letter-spacing:0.3em;color:#0B5D3B;">
                ${code}
              </div>
            </div>
            <p style="margin:0 0 16px;color:#6B7A8F;font-size:13px;line-height:1.6;">
              This code expires in ${expiresIn} minutes. If you didn't try to sign in, you can safely ignore this email.
            </p>
            <p style="margin:0;color:#6B7A8F;font-size:12px;line-height:1.5;">
              LandAus — Find home, not rejection. · <a href="mailto:support@landaus.com.au" style="color:#0B5D3B;">support@landaus.com.au</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

  // Send via Resend
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [toEmail], subject, html, text }),
  })
  if (!resp.ok) {
    const body = await resp.text().catch(() => '')
    return json({ success: false, error: 'email_send_failed', detail: body.slice(0, 200) }, 502)
  }

  return json({ success: true, message: 'Code sent.' })
})
