import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useEmailMfaStatus() {
  const [isEmailMfaVerified, setIsEmailMfaVerified] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) setIsEmailMfaVerified(false);
          return;
        }

        const { data, error } = await supabase.rpc('is_session_email_mfa_verified', {
          p_session_token: session.access_token,
        });

        if (!cancelled) setIsEmailMfaVerified(data === true && !error);
      } catch (e) {
        if (!cancelled) setIsEmailMfaVerified(false);
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  return isEmailMfaVerified;
}
