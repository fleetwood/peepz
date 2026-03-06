import { useMutation } from '@tanstack/react-query'
import * as React from 'react'

import { clientEnv } from '@peeps/config/env'
import {
  type ClientHttpConfig,
  type FamilySearchResult,
  type PaginatedResponse
} from '@peeps/types'
import { WebRestApi } from '../fetch/WebRestApi'

import { QueryManager } from '../QueryManager'
import { FamilyInvalidation, FamilyKeys } from './family.invalidation'

type PaginationParams = {
  limit: number
  cursor?: string
}

type FamilyDetailParams = {
  groupId: string
}

type FamiliesByStubParams = {
  stub: string
}

type FamilyListParams = {
  pagination: PaginationParams
}

type FamilySearchParams = {
  query     : string
  pagination: PaginationParams
}

type CreateFamilyParams = {
  name          : string
  description  ?: string
  privacyLevel ?: string
  governanceModel?: string
  removalPolicy ?: string
  voteThreshold ?: number | null
}

type FamilyCreateResponse = {
  families: {
    id: string
    groupId: string
    createdAt: string
    updatedAt: string
  }
  groups: {
    id: string
    name: string
    type: string
    description?: string
    privacyLevel: string
    governanceModel: string
    removalPolicy: string
    createdByMemberId: string
    createdAt: string
    updatedAt: string
  }
}

type FamilyClientDeps<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse> = {
  resolve: () => Promise<TResolveFamilyResponse>
  list   : (params: FamilyListParams) => Promise<TFamilyListResponse>
  detail : (params: FamilyDetailParams) => Promise<TFamilyResponse>
  search : (params: FamilySearchParams) => Promise<FamilySearchResult[]>
  listByStub: (params: FamiliesByStubParams) => Promise<FamilySearchResult[]>
  create : (params: CreateFamilyParams) => Promise<FamilyCreateResponse>
}

type FamilyClientWebConfig = {
  baseUrl?: string
}

type DefaultFamilyDetailResponse = FamilySearchResult
type DefaultFamilyListResponse = PaginatedResponse<FamilySearchResult>
type DefaultFamilySearchResponse = FamilySearchResult[]
type DefaultFamilyResolveResponse = unknown

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

      create(params: CreateFamilyParams) {
        return deps.create(params)
      },

      list(params: FamilyListParams) {
        return deps.list(params)
      },

      detail(params: FamilyDetailParams) {
        return deps.detail(params)
      },

      listByStub(params: FamiliesByStubParams) {
        return deps.listByStub(params)
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

      useFamiliesByStub(params: FamiliesByStubParams) {
        return QueryManager.domainQuery({
          ...FamilyKeys.stubList({ stub: params.stub }),
          queryFn: async () => deps.listByStub(params),
        })
      },

      useSearch(params: FamilySearchParams) {
        return QueryManager.domainQuery<FamilySearchResult[]>({
          ...FamilyKeys.search({ query: params.query }),
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

      useCreate() {
        return useMutation({
          mutationFn: async (params: CreateFamilyParams) => deps.create(params),
          onSuccess : async () => {
            await Promise.all([
              FamilyInvalidation.invalidateList(),
              FamilyInvalidation.invalidateSearch({ query: '' }),
            ])
          },
        })
      },
    } as const

    return base
  },

  createHttp<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>(
    config: ClientHttpConfig,
  ) {
    return FamilyClient.create<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>({
      async resolve() {
        const { data, error, status, statusText } = await WebRestApi.post<TResolveFamilyResponse, Record<string, never>>(
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
        const { data, error, status, statusText } = await WebRestApi.fetch<TFamilyListResponse>(path)

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.list failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },

      async detail({ groupId }) {
        const { data, error, status, statusText } = await WebRestApi.fetch<TFamilyResponse>(`/families/${groupId}`)

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.detail failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },

      async listByStub({ stub }) {
        const { data, error, status, statusText } = await WebRestApi.fetch<FamilySearchResult[]>(`/families/by-stub/${encodeURIComponent(stub)}`)

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.listByStub failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },

      async search({ query, pagination }) {
        const cursorPart = pagination.cursor ? `&cursor=${encodeURIComponent(String(pagination.cursor))}` : ''
        const path = `/families/search?query=${encodeURIComponent(query)}&limit=${encodeURIComponent(String(pagination.limit))}${cursorPart}`
        const { data, error, status, statusText } = await WebRestApi.fetch<{ data: FamilySearchResult[] }>(path)

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.search failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        // Extract data from paginated response
        return data.data || []
      },

      async create(params: CreateFamilyParams) {
        const { data, error, status, statusText } = await WebRestApi.post<FamilyCreateResponse, CreateFamilyParams>(
          '/families',
          params,
        )

        if (error || !data) {
          throw new Error(`FamilyClient.createHttp.create failed: ${status ?? ''} ${statusText ?? ''} ${error ?? ''}`.trim())
        }

        return data
      },
    })
  },

  createWeb<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>(
    config?: FamilyClientWebConfig,
  ) {
    const baseUrl = config?.baseUrl ?? ''

    return FamilyClient.createHttp<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>({
      baseUrl,
      apiKey: clientEnv.API_KEY,
    })
  },
} as const

export function useFamilyClient<
  TResolveFamilyResponse = DefaultFamilyResolveResponse,
  TFamilyResponse        = DefaultFamilyDetailResponse,
  TFamilyListResponse    = DefaultFamilyListResponse,
  TFamilySearchResponse  = DefaultFamilySearchResponse,
>(config?: FamilyClientWebConfig) {
  return React.useMemo(
    () =>
      FamilyClient.createWeb<TResolveFamilyResponse, TFamilyResponse, TFamilyListResponse, TFamilySearchResponse>(
        config,
      ),
    [config?.baseUrl],
  )
}
