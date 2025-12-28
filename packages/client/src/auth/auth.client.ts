import { useMutation } from '@tanstack/react-query'

import { PEEPS_API_KEY_HEADER } from '@peeps/config/constants/queryManager'
import { clientEnv } from '@peeps/config/env'

import { createSupabaseClient } from '../supabase/client'
import { AuthInvalidation, AuthKeys } from './auth.invalidation'

type AuthClientDeps<TEnsureMemberResponse> = {
  ensureMember: () => Promise<TEnsureMemberResponse>
}

type AuthClientHttpConfig = {
  baseUrl        : string
  getAccessToken?: () => Promise<string | null>
  apiKey?        : string
  fetchFn?       : typeof fetch
}

type AuthClientWebConfig = {
  baseUrl?: string
  apiKey? : string
}

type SignInWithEmailParams = {
  email: string
}

export const AuthClient = {
  create<TEnsureMemberResponse>(deps: AuthClientDeps<TEnsureMemberResponse>) {
    const base = {
      keys        : AuthKeys,
      invalidation: AuthInvalidation,

      ensureMember() {
        return deps.ensureMember()
      },

      useEnsureMember() {
        return useMutation({
          mutationFn: async () => deps.ensureMember(),
          onSuccess : async () => {
            await AuthInvalidation.invalidateEnsureMember()
          },
        })
      },
    } as const

    return base
  },

  createHttp<TEnsureMemberResponse>(config: AuthClientHttpConfig) {
    const fetchFn = config.fetchFn ?? fetch

    return AuthClient.create<TEnsureMemberResponse>({
      async ensureMember() {
        const accessToken = await config.getAccessToken?.()
        const res = await fetchFn(`${config.baseUrl}/api/auth/ensure-member`, {
          method : 'POST',
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(config.apiKey ? { [PEEPS_API_KEY_HEADER]: config.apiKey } : {}),
          },
        })

        if (!res.ok) {
          throw new Error(`AuthClient.createHttp.ensureMember failed: ${res.status} ${res.statusText}`)
        }

        return (await res.json()) as TEnsureMemberResponse
      },
    })
  },

  createWeb<TEnsureMemberResponse>(config?: AuthClientWebConfig) {
    const baseUrl = config?.baseUrl ?? ''
    const apiKey = config?.apiKey

    const supabase = createSupabaseClient({
      supabaseUrl    : clientEnv.SUPABASE_URL,
      supabaseAnonKey: clientEnv.SUPABASE_ANON_KEY,
    })

    const http = AuthClient.createHttp<TEnsureMemberResponse>({
      baseUrl,
      apiKey,
      getAccessToken: async () => {
        const { data, error } = await supabase.auth.getSession()
        if (error) return null
        return data.session?.access_token ?? null
      },
    })

    const base = {
      keys        : AuthKeys,
      invalidation: AuthInvalidation,

      async signInWithEmail(params: SignInWithEmailParams) {
        const trimmed = params.email.trim()
        if (!trimmed) {
          throw new Error('Enter an email')
        }

        const { error } = await supabase.auth.signInWithOtp({
          email  : trimmed,
          options: {
            emailRedirectTo: `${clientEnv.APP_URL}/login`,
          },
        })

        if (error) {
          throw new Error(error.message)
        }

        return 'Check your email for a login link.'
      },

      async signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options : {
            redirectTo: `${clientEnv.APP_URL}/login`,
          },
        })

        if (error) {
          throw new Error(error.message)
        }
      },

      async ensureMember() {
        return http.ensureMember()
      },

      async continueAfterAuth() {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          throw new Error(error.message)
        }

        const accessToken = data.session?.access_token
        if (!accessToken) {
          throw new Error('No session yet. Use Email or Google sign-in first.')
        }

        return http.ensureMember()
      },

      async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) {
          throw new Error(error.message)
        }
      },
    } as const

    return base
  },
} as const
