import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uwyocrzcbqqaznoehuuz.supabase.co'
const supabaseAnonKey = 'sb_publishable_t0W93G5rMRFSdkcI81zAxA_CH6yKoK0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // localStorage is the default — keeps us off document.cookie so we don't
    // have to wrangle SameSite/Secure flags manually.
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce'
  }
})
