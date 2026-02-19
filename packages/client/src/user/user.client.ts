import { QueryManager } from '../QueryManager'
import { useMutation } from '@tanstack/react-query'

import { clientEnv } from '@peeps/config/env'
import { WebRestApi } from '@peeps/utils/fetch/web'

import { createSupabaseClient } from '../supabase/client'
import { UserInvalidation, UserKeys } from './user.invalidation'

type UserClientDeps<TUserDto> = {
  me: () => Promise<TUserDto | null>
  updateProfile: (input: any) => Promise<{ member: any; person: any; onboarding: any }>
}

type UserClientHttpConfig = {
  baseUrl        : string
  getAccessToken?: () => Promise<string | null>
  apiKey?        : string
  fetchFn?       : typeof fetch
  updateProfile?: (input: any) => Promise<{ member: any; person: any; onboarding: any }>
}

type UserClientWebConfig = {
  baseUrl?: string
}

export const UserClient = {
  create<TUserDto>(deps: UserClientDeps<TUserDto>) {
    const base = {
      keys        : UserKeys,
      invalidation: UserInvalidation,

      me() {
        return deps.me()
      },

      useMe() {
        return QueryManager.domainQuery({
          ...UserKeys.me(),
          queryFn: async () => deps.me(),
        })
      },

      updateProfile(input: any) {
        return deps.updateProfile(input)
      },

      useUpdateProfile() {
        return useMutation({
          mutationFn: async (input: any) => deps.updateProfile(input),
          onSuccess: async () => {
            await UserInvalidation.invalidateMe()
          }
        })
      },

      invalidateMe() {
        return UserInvalidation.invalidateMe()
      },

      refetchMe() {
        return UserInvalidation.refetchMe()
      },
    } as const

    return base
  },

  createHttp<TUserDto>(config: UserClientHttpConfig) {
    WebRestApi.configure({
      apiKey        : config.apiKey ?? clientEnv.API_KEY,
      getAccessToken: config.getAccessToken,
      baseUrl       : config.baseUrl,
    })

    return UserClient.create<TUserDto>({
      async me() {
        const { data, error, status, statusText } = await WebRestApi.fetch<TUserDto>('/me')

        if (status === 401) return null
        if (error || !data) {
          throw new Error(`UserClient.createHttp.me failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        // API now returns flattened structure, so just return as-is
        return data
      },
      async updateProfile(input: any) {
        console.log('UserClient.updateProfile: Starting update with input:', input);
        const { data, error, status, statusText } = await WebRestApi.post('/onboarding/profile', input)
        console.log('UserClient.updateProfile: Response:', { data, error, status, statusText });

        if (error || !data) {
          throw new Error(`UserClient.updateProfile failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },
    })
  },

  createWeb<TUserDto>(config?: UserClientWebConfig) {
    const baseUrl = config?.baseUrl ?? ''

    const supabase = createSupabaseClient({
      supabaseUrl    : clientEnv.SUPABASE_URL,
      supabaseAnonKey: clientEnv.SUPABASE_ANON_KEY,
    })

    return UserClient.createHttp<TUserDto>({
      baseUrl,
      apiKey: clientEnv.API_KEY,
      getAccessToken: async () => {
        const { data, error } = await supabase.auth.getSession()
        if (error) return null
        return data.session?.access_token ?? null
      },
    })
  },
} as const
