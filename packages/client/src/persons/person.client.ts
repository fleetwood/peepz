import { useMutation } from '@tanstack/react-query'

import { QueryManager } from '../QueryManager'

import { clientEnv } from '@peeps/config/env'
import { fetchApi, postApi, setRestAuthConfig } from '@peeps/utils/rest'

import { createSupabaseClient } from '../supabase/client'
import { PersonInvalidation, PersonKeys } from './person.invalidation'

type PersonClientDeps<TPerson> = {
  list  : () => Promise<TPerson[]>
  byId  ?: (params: { id: string }) => Promise<TPerson | null>
  create?: (params: { input: unknown }) => Promise<TPerson>
}

type PersonClientHttpConfig = {
  baseUrl         : string
  getAccessToken? : () => Promise<string | null>
  apiKey?         : string
  fetchFn?        : typeof fetch
}

type PersonClientWebConfig = {
  baseUrl?: string
}

export const PersonClient = {
  create<TPerson>(deps: PersonClientDeps<TPerson>) {
    const base = {
      keys        : PersonKeys,
      invalidation: PersonInvalidation,

      useList() {
        return QueryManager.domainQuery({
          ...PersonKeys.list(),
          queryFn  : async () => {
            return deps.list()
          },
        })
      },

      useById(params: { id: string }) {
        if (!deps.byId) {
          throw new Error('PersonClient.useById requires deps.byId')
        }

        return QueryManager.domainQuery({
          ...PersonKeys.detail({ id: params.id }),
          enabled  : Boolean(params.id),
          queryFn  : async () => {
            return deps.byId!({ id: params.id })
          },
        })
      },

      useDetail(params: { id: string }) {
        return base.useById({ id: params.id })
      },

      invalidateList() {
        return PersonInvalidation.invalidateList()
      },

      invalidateDetail(params: { id: string }) {
        return PersonInvalidation.invalidateDetail({ id: params.id })
      },

      useCreate() {
        if (!deps.create) {
          throw new Error('PersonClient.useCreate requires deps.create')
        }

        return useMutation({
          mutationFn: (params: { input: unknown }) => deps.create!(params),
          onSuccess : async () => {
            await PersonInvalidation.invalidateList()
          },
        })
      },
    } as const

    return base
  },

  createHttp<TPerson>(config: PersonClientHttpConfig) {
    setRestAuthConfig({
      apiKey        : config.apiKey ?? clientEnv.API_KEY,
      getAccessToken: config.getAccessToken,
      baseUrl       : config.baseUrl,
    })

    return PersonClient.create<TPerson>({
      async list() {
        const { data, error, status, statusText } = await fetchApi<TPerson[]>('/persons')

        if (error || !data) {
          throw new Error(`PersonClient.createHttp.list failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },

      async byId(params: { id: string }) {
        const { data, error, status, statusText } = await fetchApi<TPerson>(`/persons/${params.id}`)

        if (status === 404) return null
        if (error || !data) {
          throw new Error(`PersonClient.createHttp.byId failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },

      async create(params: { input: unknown }) {
        const { data, error, status, statusText } = await postApi<TPerson, unknown>(
          '/persons',
          params.input,
        )

        if (error || !data) {
          throw new Error(`PersonClient.createHttp.create failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },
    })
  },

  createWeb<TPerson>(config?: PersonClientWebConfig) {
    const baseUrl = config?.baseUrl ?? ''

    const supabase = createSupabaseClient({
      supabaseUrl    : clientEnv.SUPABASE_URL,
      supabaseAnonKey: clientEnv.SUPABASE_ANON_KEY,
    })

    return PersonClient.createHttp<TPerson>({
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
