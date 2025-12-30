import { QueryManager } from '../QueryManager'

import { clientEnv } from '@peeps/config/env'
import { fetchApi, setRestAuthConfig } from '@peeps/utils/rest'

import { createSupabaseClient } from '../supabase/client'
import { UserInvalidation, UserKeys } from './user.invalidation'

type UserClientDeps<TUserDto> = {
  me: () => Promise<TUserDto | null>
}

type UserClientHttpConfig = {
  baseUrl        : string
  getAccessToken?: () => Promise<string | null>
  apiKey?        : string
  fetchFn?       : typeof fetch
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
    setRestAuthConfig({
      apiKey        : config.apiKey ?? clientEnv.API_KEY,
      getAccessToken: config.getAccessToken,
      baseUrl       : config.baseUrl,
    })

    return UserClient.create<TUserDto>({
      async me() {
        const { data, error, status, statusText } = await fetchApi<TUserDto>('/me')

        if (status === 401) return null
        if (error || !data) {
          throw new Error(`UserClient.createHttp.me failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
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
