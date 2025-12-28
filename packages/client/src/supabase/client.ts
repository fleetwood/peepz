import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type SupabaseClientConfig = {
  supabaseUrl    : string
  supabaseAnonKey: string
}

export function createSupabaseClient(config: SupabaseClientConfig): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession    : true,
      detectSessionInUrl: true,
    },
  })
}

export type { SupabaseClient }
