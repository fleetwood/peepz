import { useMutation } from '@tanstack/react-query'

import { clientEnv } from '@peeps/config/env'
import { ErrorCodeEnum } from '@peeps/types'
import type { AuthProviderId as AuthProviderIdType, ContinueAfterAuthResult } from '@peeps/types'
import { WebRestApi } from '@peeps/utils/fetch/web'

import { SupabaseClient } from '../supabase/client'
import { AuthInvalidation, AuthKeys } from './auth.invalidation'
import { createAuthProviderRegistry } from './providers/providerRegistry'

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

type StartIdentityLinkParams = {
  provider: string
}

type SignInParams = {
  providerId: AuthProviderIdType
  params?    : unknown
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
    WebRestApi.configure({
      apiKey        : config.apiKey ?? clientEnv.API_KEY,
      getAccessToken: config.getAccessToken,
      baseUrl       : config.baseUrl,
    })

    return AuthClient.create<TEnsureMemberResponse>({
      async ensureMember() {
        const { data, error, status, statusText } = await WebRestApi.post<TEnsureMemberResponse, Record<string, never>>(
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

    const supabase = SupabaseClient.get()

    const providers = createAuthProviderRegistry({
      redirectTo: `${clientEnv.APP_URL}/login`,
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

      providers,

      async signIn(params: SignInParams) {
        const provider = providers.get(params.providerId)
        return provider.signIn(params.params as any)
      },

      async ensureMember() {
        return http.ensureMember()
      },

      async ensureMemberResult(): Promise<ContinueAfterAuthResult<TEnsureMemberResponse>> {
        const { data, error, code, errorDetails } = await WebRestApi.post<TEnsureMemberResponse, Record<string, never>>(
          '/auth/ensure-member',
          {},
        )

        if (!error && data) {
          return { kind: 'ok', data }
        }

        if (code === ErrorCodeEnum.AUTH_IDENTITY_LINK_REQUIRED) {
          const provider = typeof errorDetails?.provider === 'string' ? errorDetails.provider : null
          return { kind: 'link_required', provider }
        }

        throw new Error(error ?? 'Failed to ensure member')
      },

      async startIdentityLink(params: StartIdentityLinkParams) {
        const { error } = await WebRestApi.post<{ ok: true }, StartIdentityLinkParams>('/auth/link-identity/start', {
          provider: params.provider,
        })

        if (error) {
          throw new Error(error)
        }

        return true as const
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

      async continueAfterAuthResult(): Promise<ContinueAfterAuthResult<TEnsureMemberResponse>> {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          throw new Error(error.message)
        }

        const accessToken = data.session?.access_token
        if (!accessToken) {
          throw new Error('No session yet. Use Email or Google sign-in first.')
        }

        return base.ensureMemberResult()
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
