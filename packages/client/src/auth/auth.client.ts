import { useMutation } from '@tanstack/react-query'

import { clientEnv } from '@peeps/config/env'
import { postApi, setRestAuthConfig } from '@peeps/utils/rest'

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
    setRestAuthConfig({
      apiKey        : config.apiKey ?? clientEnv.API_KEY,
      getAccessToken: config.getAccessToken,
      baseUrl       : config.baseUrl,
    })

    return AuthClient.create<TEnsureMemberResponse>({
      async ensureMember() {
        const { data, error, status, statusText } = await postApi<TEnsureMemberResponse, Record<string, never>>(
          '/auth/ensure-member',
          {},
        )

        if (error || !data) {
          throw new Error(`AuthClient.createHttp.ensureMember failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },
    })
  },

  createWeb<TEnsureMemberResponse>(config?: AuthClientWebConfig) {
    const baseUrl = config?.baseUrl ?? ''
    const apiKey = config?.apiKey ?? clientEnv.API_KEY

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
