import { useMutation } from '@tanstack/react-query'

import { clientEnv } from '@peeps/config/env'
import { type PaginationParams } from '@peeps/types'
import { fetchApi, postApi, setRestAuthConfig } from '@peeps/utils/rest'

import { QueryManager } from '../QueryManager'
import { createSupabaseClient } from '../supabase/client'
import { FamilyInvalidation, FamilyKeys } from './family.invalidation'

type FamilyDetailParams = {
  groupId: string
}

type FamilyListParams = {
  pagination: PaginationParams
}

type FamilySearchParams = {
  query     : string
  pagination: PaginationParams
}

type FamilyClientDeps<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse> = {
  resolve: () => Promise<TResolveFamilyResponse>
  list   : (params: FamilyListParams) => Promise<TFamilyListResponse>
  detail : (params: FamilyDetailParams) => Promise<TFamilyResponse>
  search : (params: FamilySearchParams) => Promise<TFamilySearchResponse>
}

type FamilyClientHttpConfig = {
  baseUrl        : string
  getAccessToken?: () => Promise<string | null>
  apiKey?        : string
  fetchFn?       : typeof fetch
}

type FamilyClientWebConfig = {
  baseUrl?: string
}

export const FamilyClient = {
  create<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>(
    deps: FamilyClientDeps<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>,
  ) {
    const base = {
      keys        : FamilyKeys,
      invalidation: FamilyInvalidation,

      resolve() {
        return deps.resolve()
      },

      list(params: FamilyListParams) {
        return deps.list(params)
      },

      detail(params: FamilyDetailParams) {
        return deps.detail(params)
      },

      search(params: FamilySearchParams) {
        return deps.search(params)
      },

      useList(params: FamilyListParams) {
        return QueryManager.paginatedDomainQuery({
          ...FamilyKeys.list(),
          pagination: params.pagination,
          queryFn  : async () => deps.list(params),
        })
      },

      useDetail(params: FamilyDetailParams) {
        return QueryManager.domainQuery({
          ...FamilyKeys.detail({ groupId: params.groupId }),
          queryFn: async () => deps.detail(params),
        })
      },

      useSearch(params: FamilySearchParams) {
        return QueryManager.paginatedDomainQuery({
          ...FamilyKeys.search({ query: params.query }),
          pagination: params.pagination,
          queryFn  : async () => deps.search(params),
        })
      },

      useResolve() {
        return useMutation({
          mutationFn: async () => deps.resolve(),
          onSuccess : async () => {
            await FamilyInvalidation.invalidateResolve()
          },
        })
      },
    } as const

    return base
  },

  createHttp<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>(
    config: FamilyClientHttpConfig,
  ) {
    setRestAuthConfig({
      apiKey        : config.apiKey ?? clientEnv.API_KEY,
      getAccessToken: config.getAccessToken,
      baseUrl       : config.baseUrl,
    })

    return FamilyClient.create<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>({
      async resolve() {
        const { data, error, status, statusText } = await postApi<TResolveFamilyResponse, Record<string, never>>(
          '/onboarding/family/resolve',
          {},
        )

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.resolve failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },

      async list({ pagination }) {
        const cursorPart = pagination.cursor ? `&cursor=${encodeURIComponent(String(pagination.cursor))}` : ''
        const path = `/families?limit=${encodeURIComponent(String(pagination.limit))}${cursorPart}`
        const { data, error, status, statusText } = await fetchApi<TFamilyListResponse>(path)

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.list failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },

      async detail({ groupId }) {
        const { data, error, status, statusText } = await fetchApi<TFamilyResponse>(`/families/${groupId}`)

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.detail failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },

      async search({ query, pagination }) {
        const cursorPart = pagination.cursor ? `&cursor=${encodeURIComponent(String(pagination.cursor))}` : ''
        const path = `/families/search?query=${encodeURIComponent(query)}&limit=${encodeURIComponent(String(pagination.limit))}${cursorPart}`
        const { data, error, status, statusText } = await fetchApi<TFamilySearchResponse>(path)

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.search failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },
    })
  },

  createWeb<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>(
    config?: FamilyClientWebConfig,
  ) {
    const baseUrl = config?.baseUrl ?? ''

    const supabase = createSupabaseClient({
      supabaseUrl    : clientEnv.SUPABASE_URL,
      supabaseAnonKey: clientEnv.SUPABASE_ANON_KEY,
    })

    return FamilyClient.createHttp<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>({
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
