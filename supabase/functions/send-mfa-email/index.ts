import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate code via RPC
    const { data: codeData, error: codeError } = await supabase.rpc('generate_email_mfa_code');
    if (codeError) {
      return new Response(JSON.stringify({ error: codeError.message }), {
        status: 429, // rate limit or other error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const code = codeData.code;

    // Get user's name for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const firstName = profile?.full_name?.split(' ')[0] || 'there';

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LandAus <noreply@landaus.com.au>',
        to: user.email,
        subject: `Your LandAus sign-in code: ${code}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #B2FCE4 0%, #8FE9CC 100%); padding: 32px; border-radius: 16px; text-align: center;">
              <h1 style="color: #0A2540; font-family: Georgia, serif; font-size: 28px; margin: 0 0 8px;">LandAus</h1>
              <p style="color: #0B5D3B; font-size: 14px; margin: 0;">Your sign-in code</p>
            </div>
            <div style="padding: 32px 0; text-align: center;">
              <p style="color: #0A2540; font-size: 16px; margin: 0 0 24px;">Hi ${firstName},</p>
              <div style="background: #F4FEFA; border: 2px solid #B2FCE4; border-radius: 12px; padding: 24px; margin: 16px 0;">
                <p style="color: #6B8295; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Your code</p>
                <p style="color: #0A2540; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: 'SF Mono', monospace;">${code}</p>
              </div>
              <p style="color: #6B8295; font-size: 14px; margin: 24px 0 0;">This code expires in 10 minutes.</p>
              <p style="color: #6B8295; font-size: 14px; margin: 8px 0;">If you didn't try to sign in, you can safely ignore this email.</p>
            </div>
            <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; text-align: center;">
              <p style="color: #6B8295; font-size: 12px; margin: 0;">Made with 💚 in Sydney · <a href="mailto:support@landaus.com.au" style="color: #0B5D3B;">support@landaus.com.au</a></p>
            </div>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-mfa-email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
