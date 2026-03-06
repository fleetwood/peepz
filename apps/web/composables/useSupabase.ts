import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app'

let client: SupabaseClient | null = null

/**
 * Vue composable for accessing Supabase client
 */
export function useSupabase() {
  if (client) return client
  const { public: pub } = useRuntimeConfig()
  client = createClient(pub.supabaseUrl as string, pub.supabaseAnonKey as string, {
    auth: { persistSession: true, detectSessionInUrl: true },
  })
  return client
}
