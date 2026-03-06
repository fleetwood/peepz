import { useMutation } from '@tanstack/react-query'

import { clientEnv } from '@peeps/config/env'
import type { AuthProviderId as AuthProviderIdType, ContinueAfterAuthResult } from '@peeps/types'
import { ErrorCodeEnum } from '@peeps/types'
import { SupabaseClient } from '../supabase/client'
import type { SupabaseClient as SupabaseJsClient } from '@supabase/supabase-js'
import { WebRestApi } from '../fetch/WebRestApi'

import { AuthInvalidation, AuthKeys } from './auth.invalidation'
import { createAuthProviderRegistry } from './providers/providerRegistry'

type AuthClientDeps<TEnsureMemberResponse> = {
  ensureMember: () => Promise<TEnsureMemberResponse>
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

  createWeb<TEnsureMemberResponse>(config?: AuthClientWebConfig, client?: ReturnType<typeof SupabaseClient.get>) {
    const baseUrl = config?.baseUrl ?? ''
    const apiKey = config?.apiKey ?? clientEnv.API_KEY

    const supabaseClient = client ?? (SupabaseClient.get() as SupabaseJsClient)

    const providers = createAuthProviderRegistry({
      redirectTo: `${clientEnv.APP_URL}/login`,
    })

    return {
      keys        : AuthKeys,
      invalidation: AuthInvalidation,

      providers,

      async signIn(params: SignInParams) {
        const provider = providers.get(params.providerId)
        return provider.signIn(params.params as any)
      },

      async ensureMember() {
        const { data, error, status, statusText } = await WebRestApi.post<TEnsureMemberResponse, Record<string, never>>(
          '/auth/ensure-member',
          {},
        )

        if (error || !data) {
          throw new Error(`AuthClient.ensureMember failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
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
        const { data, error } = await supabaseClient.auth.getSession()
        if (error) {
          throw new Error(error.message)
        }

        const accessToken = data.session?.access_token
        if (!accessToken) {
          throw new Error('No session yet. Use Email or Google sign-in first.')
        }

        return this.ensureMember()
      },

      async continueAfterAuthResult(): Promise<ContinueAfterAuthResult<TEnsureMemberResponse>> {
        const { data, error } = await supabaseClient.auth.getSession()
        if (error) {
          throw new Error(error.message)
        }

        const accessToken = data.session?.access_token
        if (!accessToken) {
          throw new Error('No session yet. Use Email or Google sign-in first.')
        }

        return this.ensureMemberResult()
      },

      async signOut() {
        const { error } = await supabaseClient.auth.signOut()
        if (error) {
          throw new Error(error.message)
        }
      },
    } as const
  },
} as const
