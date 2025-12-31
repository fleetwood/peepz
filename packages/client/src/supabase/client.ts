import * as React from 'react'

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

export class SupabaseClient {
  private static instance: SupabaseJsClient | null = null

  static get() {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = createSupabaseClient({
        supabaseUrl    : clientEnv.SUPABASE_URL,
        supabaseAnonKey: clientEnv.SUPABASE_ANON_KEY,
      })
    }

    return SupabaseClient.instance
  }

  static use() {
    return React.useMemo(() => SupabaseClient.get(), [])
  }

  static auth = {
    getSession() {
      return SupabaseClient.get().auth.getSession()
    },
    signOut() {
      return SupabaseClient.get().auth.signOut()
    },
  } as const
}

// eslint-disable-next-line no-restricted-syntax
export type { SupabaseJsClient }
