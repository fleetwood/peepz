import { useMutation } from '@tanstack/react-query'

import { PEEPS_API_KEY_HEADER } from '@peeps/config/constants/queryManager'
import { type PaginationParams } from '@peeps/types/response/paginated.response'
import { postApi } from '@peeps/utils/rest'

import { QueryManager } from '../QueryManager'
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
    const fetchFn = config.fetchFn ?? fetch

    return FamilyClient.create<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>({
      async resolve() {
        const { data, error, status, statusText } = await postApi<TResolveFamilyResponse, Record<string, never>>(
          `${config.baseUrl}/api/onboarding/family/resolve`,
          {},
          {
            auth: {
              apiKey        : config.apiKey ?? '',
              getAccessToken: config.getAccessToken,
            },
          },
        )

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.resolve failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },

      async list({ pagination }) {
        const url = new URL(`${config.baseUrl}/api/families`)
        url.searchParams.set('page', String(pagination.page))
        url.searchParams.set('limit', String(pagination.limit))

        const res = await fetchFn(url.toString(), {
          method : 'GET',
          headers: {
            ...(config.apiKey ? { [PEEPS_API_KEY_HEADER]: config.apiKey } : {}),
          },
        })

        if (!res.ok) {
          throw new Error(`FamilyClient.createHttp.list failed: ${res.status} ${res.statusText}`)
        }

        return (await res.json()) as TFamilyListResponse
      },

      async detail({ groupId }) {
        const res = await fetchFn(`${config.baseUrl}/api/families/${groupId}`, {
          method : 'GET',
          headers: {
            ...(config.apiKey ? { [PEEPS_API_KEY_HEADER]: config.apiKey } : {}),
          },
        })

        if (!res.ok) {
          throw new Error(`FamilyClient.createHttp.detail failed: ${res.status} ${res.statusText}`)
        }

        return (await res.json()) as TFamilyResponse
      },

      async search({ query, pagination }) {
        const url = new URL(`${config.baseUrl}/api/families/search`)
        url.searchParams.set('query', query)
        url.searchParams.set('page', String(pagination.page))
        url.searchParams.set('limit', String(pagination.limit))

        const res = await fetchFn(url.toString(), {
          method : 'GET',
          headers: {
            ...(config.apiKey ? { [PEEPS_API_KEY_HEADER]: config.apiKey } : {}),
          },
        })

        if (!res.ok) {
          throw new Error(`FamilyClient.createHttp.search failed: ${res.status} ${res.statusText}`)
        }

        return (await res.json()) as TFamilySearchResponse
      },
    })
  },
} as const
