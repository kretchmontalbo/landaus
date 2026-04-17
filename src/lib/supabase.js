import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uwyocrzcbqqaznoehuuz.supabase.co'
const supabaseAnonKey = 'sb_publishable_t0W93G5rMRFSdkcI81zAxA_CH6yKoK0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
