import { QueryManager } from '../QueryManager'

import { clientEnv } from '@peeps/config/env'

import { createSupabaseClient } from '../supabase/client'
import { UserInvalidation, UserKeys } from './user.invalidation'

type UserClientDeps<TUserDto> = {
  me: () => Promise<TUserDto | null>
}

type UserClientHttpConfig = {
  baseUrl        : string
  getAccessToken?: () => Promise<string | null>
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
    const fetchFn = config.fetchFn ?? fetch

    return UserClient.create<TUserDto>({
      async me() {
        const accessToken = await config.getAccessToken?.()
        if (!accessToken) return null

        const res = await fetchFn(`${config.baseUrl}/api/me`, {
          method : 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (res.status === 401) {
          return null
        }

        if (!res.ok) {
          throw new Error(`UserClient.createHttp.me failed: ${res.status} ${res.statusText}`)
        }

        return (await res.json()) as TUserDto
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
      getAccessToken: async () => {
        const { data, error } = await supabase.auth.getSession()
        if (error) return null
        return data.session?.access_token ?? null
      },
    })
  },
} as const
