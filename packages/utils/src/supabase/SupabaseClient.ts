import { createClient, type SupabaseClient as SupabaseJsClient } from '@supabase/supabase-js'

import { clientEnv } from '@peeps/config/env'

type SupabaseClientConfig = {
  supabaseUrl    : string
  supabaseAnonKey: string
}

export function createSupabaseClient(config: SupabaseClientConfig): SupabaseJsClient {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession    : true,
      detectSessionInUrl: true,
    },
  })
}

export class SupabaseInstance {
  private static instance: SupabaseJsClient | null = null

  static get() {
    if (!SupabaseInstance.instance) {
      SupabaseInstance.instance = createSupabaseClient({
        supabaseUrl    : clientEnv.SUPABASE_URL,
        supabaseAnonKey: clientEnv.SUPABASE_ANON_KEY,
      })
    }

    return SupabaseInstance.instance
  }

  static auth = {
    getSession() {
      return SupabaseInstance.get().auth.getSession()
    },
    signOut() {
      return SupabaseInstance.get().auth.signOut()
    },
  } as const
}

// eslint-disable-next-line no-restricted-syntax
export type { SupabaseJsClient }
