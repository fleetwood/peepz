import { PaginationParams } from "./response/paginated.response"

// Generic types that don't depend on React Query
export type QueryKey = readonly unknown[]
export type QueryFunction<TData = unknown, TQueryKey extends QueryKey = QueryKey> = (context: {
  queryKey: TQueryKey
  signal?: AbortSignal
  meta?: Record<string, any>
}) => TData | Promise<TData>

/**
 * Domain constants for the QueryManager
 * 
 * These constants represent the primary domains in the system
 * and should be used instead of string literals when registering
 * query keys with domains.
 */


  /**
 * Primary domains in the system
 */
export enum QueryDomainEnum {
  ADMIN   = 'ADMIN',
  APP     = 'APP',
  USER    = 'USER',
  CHAT    = 'CHAT',
  CONTENT = 'CONTENT',
  EVENTS  = 'EVENTS',
  MEMBERS = 'MEMBERS',
  NOTIFS  = 'NOTIFS',
  PARTIES = 'PARTIES',
  POSTS   = 'POSTS',
  STRIPE  = 'STRIPE',
}

  /**
 * Subdomains representing intersections of primary domains
 */
export enum QuerySubdomainEnum {
  DETAIL               = 'DETAIL',
  FEED                 = 'FEED',
  LIST                 = 'LIST',
  MEMBERS_FEED         = 'MEMBERS_FEED',
  MESSAGES             = 'MESSAGES',
  PERMISSIONS          = 'PERMISSIONS',
  POSTS_FEED           = 'POSTS_FEED',
  STATS                = 'STATS',
}

  /**
 * Domain metadata for a query key
 */
export type QueryDomainMeta = {
  subdomain?: string
  params   ?: Record<string, any>
} & (
  {
    domain: QueryDomainEnum
  } | {
    domains: QueryDomainEnum[]
  }
)

export type InvalidationOptions = QueryDomainMeta & {
  refetch  ?: boolean
}

  /**
 * Subscription group for related queries
 */
export type QueryGroup = {
  name: string
  keys: QueryKey[]
}

/**
 * Generic query options (framework-agnostic)
 */
export type QueryOptions<TData = unknown, TError = unknown> = {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  retry?: boolean | number
  retryDelay?: number
  onSuccess?: (data: TData) => void
  onError?: (error: TError) => void
}

/**
 * Options for domain query
 */
export type DomainQueryOptions<TData = unknown, TError = unknown, TQueryKey extends QueryKey = QueryKey> = {
  /**
   * Query function to execute
   */
  queryFn: QueryFunction<TData, TQueryKey>
} & QueryDomainMeta & QueryOptions<TData, TError>

/**
 * Options for pagination domain query
 */
export type PaginationQueryOptions<TData = unknown, TError = unknown, TQueryKey extends QueryKey = QueryKey> = {
  /**
   * Query function to execute
   */
  queryFn: QueryFunction<TData, TQueryKey>
  
  /**
   * Pagination parameters
   */
  pagination: PaginationParams
  
  /**
   * Additional parameters to associate with this query
   * These will be included in the final query key along with pagination params
   */
  params?: Record<string, any>
} & QueryDomainMeta & QueryOptions<TData, TError>

/**
 * Result type for domain query (generic, framework-agnostic)
 * Matches React Query's UseQueryResult structure
 */
export type DomainQueryResult<TData = unknown, TError = unknown> = {
  data: TData | undefined
  error: TError | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  isFetching: boolean
  isPending: boolean
  status: 'pending' | 'error' | 'success'
  refetch: () => Promise<any>
}

  /**
 * Domain group for organizing queries by domain
 */
export type DomainGroup = {
  name: QueryDomainEnum  // Changed from string to QueryDomain
  keys: QueryKey[]
}

  /**
 * Subdomain group for organizing queries by subdomain
 */
export type SubdomainGroup = {
  name         : string
  parentDomains: QueryDomainEnum[]  // Changed from string[] to QueryDomain[]
  keys         : QueryKey[]
}
