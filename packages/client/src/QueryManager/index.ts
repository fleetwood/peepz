"use client"

/// **💀💀 ABSOLUTE AI PROHIBITION: 💀💀** 
/// DO NOT MAKE ANY CHANGES TO THIS FILE!!!
/// It is a critical, STABLE file that manages the ENTIRE app query system.
/// This means you, bot!
/// 

import { QM_PREFIX } from '@peeps/config/constants/queryManager'
import { 
  DomainGroup,
  DomainQueryOptions,
  DomainQueryResult,
  InvalidationOptions,
  PaginationQueryOptions,
  QueryDomainEnum,
  QueryDomainMeta,
  QuerySubdomainEnum,
  SubdomainGroup
} from '@peeps/types'
import { Logger, ruid } from '@peeps/utils'
import { QueryClient, QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query'

const logger = Logger.instance('QueryManager', false)

/**
 * QueryManager: Centralized static manager for query invalidation and management
 *
 * For detailed implementation patterns and best practices, see:
 * @see doc/QueryManager.md
 *
 * Key features:
 * - Structured query key management with domains and subdomains
 * - Automatic query invalidation and refetching
 * - Type-safe query operations with enum constants
 * - Domain-based query organization and cleanup
 */
export class QueryManager {
  private static queryClient: QueryClient | null = null
  private static domains:     Map<QueryDomainEnum, DomainGroup> = new Map()
  private static subdomains:  Map<string, SubdomainGroup> = new Map()
  private static loggedPlaceholders: Set<string> = new Set()

  /**
   * Get the current QueryClient instance
   * @returns The current QueryClient instance
   */
  private static currentClient(): QueryClient {
    if (!QueryManager.queryClient) {
      throw new Error('QueryManager not initialized. Call QueryManager.init() first.')
    }
    return QueryManager.queryClient
  }

  /**
   * Initialize the QueryManager with a QueryClient
   * Call this during app initialization (e.g., in _app.tsx)
   */
  public static init(client: QueryClient): void {
    QueryManager.queryClient = client
  }

  /**
   * Ensure a query key is in array format for TanStack Query
   */
  private static ensureArrayKey(key: QueryKey): QueryKey {
    return Array.isArray(key) ? key : [key]
  }

  /**
   * Add the QueryManager prefix to a query key
   * This makes it easy to identify QueryManager-managed keys in devtools
   */
  private static addPrefix(key: QueryKey): QueryKey {
    const arrayKey = QueryManager.ensureArrayKey(key)
    // Only add prefix if it's not already there
    if (arrayKey[0] === QM_PREFIX) {
      return arrayKey
    }
    return [QM_PREFIX, ...arrayKey]
  }

  /**
   * Register a query key with domains and optionally a subdomain
   * @param key The query key to register
   * @param options Options including domains, subdomain, groups, and placeholder context
   * @returns The key in array format for TanStack Query compatibility
   * @throws Error if the key is empty or domains are invalid
   * @internal This method is intended for internal use only.
   *
   * IMPORTANT: External code should use domainQuery() or paginatedDomainQuery() instead.
   * This method is exposed only for backward compatibility and special cases.
   */
  /* @internal */
  private static registerKeyWithDomains(
    key: QueryKey,
    options?: {
      domains    ?: QueryDomainEnum[]
      subdomain  ?: string
      /**
       * @deprecated placeholders are now generated dynamically, and will throw if none can be generated
       */
      placeholder?: string
      params     ?: Record<string, any>
    }
  ): QueryKey {
    // If the key is empty use a placeholder instead of throwing an error
    if ((!key || (Array.isArray(key) && key.length === 0))) {
      
      // Generate key from available options, fallback to placeholder
      const keyParts = [
        options?.subdomain,
        options?.params && Object.keys(options.params).length > 0 ? options.params : undefined,
        ...(options?.domains || [])
      ].filter(Boolean)
      
      key = keyParts.length > 0 ? keyParts : [options?.params, {ruid: ruid()}]
      
      logger.debug('registerKeyWithDomains: Generated key', { key, keyParts, usedPlaceholder: keyParts.length === 0 })
      
      // Only log placeholder usage once to avoid spam
      if (keyParts.length === 0 && !QueryManager.loggedPlaceholders.has(key.toString())) {
        logger.debug('Using placeholder for empty query key', key)
        QueryManager.loggedPlaceholders.add(key.toString())
      }
    } else if (!key || (Array.isArray(key) && key.length === 0)) {
      logger.error('Attempted to register an empty query key', options)
      throw new Error(
        `QueryManager: Cannot register an empty query key. Check the logs for details.`
      )
    }

    const opts = options || {}
    const domains =
      opts.domains && opts.domains.length > 0 ? opts.domains : QueryManager.inferDomainsFromKey(key)
    if (domains.length === 0) {
      logger.warn(
        `No domains provided or inferred for key: ${key}}. This query will not be part of any domain.`
      )
    }

    const processedKey = QueryManager.processKeyWithPlaceholders(key, opts.placeholder)
    const params: Record<string, any> = {}

    if (Array.isArray(processedKey)) {
      Object.assign(
        params,
        ...processedKey.filter(
          item => typeof item === 'object' && item !== null && !Array.isArray(item)
        )
      );
    }

    if (opts.params) {
      Object.assign(params, opts.params)
    }
    const finalKeyArray: any[] = [QM_PREFIX]
    const primaryDomain = domains.length > 0 ? domains[0] : undefined

    finalKeyArray.push(
      ...[primaryDomain, opts.subdomain, Object.keys(params).length > 0 ? params : undefined].filter(
        part => part !== undefined
      )
    );

    const finalKey: QueryKey = finalKeyArray as QueryKey
    domains.forEach((domain: QueryDomainEnum) => {
      QueryManager.addToDomain(domain, finalKey)
    })

    if (opts.subdomain) {
      QueryManager.addToSubdomain(opts.subdomain, domains, finalKey)
    }

    return finalKey
  }

  /**
   * Execute a query with domain-based organization
   * @param options Query options including domain, subdomain, and parameters
   * @returns Query result
   */
  static domainQuery<TData = unknown, TError = unknown, TQueryKey extends QueryKey = QueryKey>(
    options: DomainQueryOptions<TData, TError, TQueryKey>
  ): DomainQueryResult<TData, TError> {
    const {
      queryFn,
      subdomain,
      params,
      enabled = true,
      ...rest
    } = options
    const emptyKey: QueryKey = []
    let queryKey: TQueryKey

    if (enabled) {
      try {
        // Handle both single domain and array domains from QueryDomainMeta
        const domainArray = 'domains' in options ? options.domains : ('domain' in options ? [options.domain] : [])
        
        queryKey = QueryManager.registerKeyWithDomains(emptyKey, {
          domains: domainArray,
          subdomain,
          params // Include params in the query key
        }) as TQueryKey
      } catch (error) {
        logger.warn('Failed to register query key, using fallback', { error })
        queryKey = ['QM', 'fallback'] as unknown as TQueryKey
      }
    } else {
      queryKey = ['QM', 'disabled'] as unknown as TQueryKey
    }

    return useQuery({
      queryKey,
      queryFn: () => {
        logger.debug('queryFn', { queryKey, queryFn })
        return queryFn({
          queryKey,
          signal: new AbortController().signal,
          meta: {
            params
          }
        })
      },
      enabled, // Pass the destructured 'enabled' flag to useQuery
      ...rest
    })
  }

  /**
   * Prefetch a query with domain-based organization
   * This is similar to domainQuery but uses prefetchQuery instead of useQuery
   *
   * @param options Options for the prefetch query including domains, subdomain, and query function
   * @returns Promise that resolves when the prefetch is complete
   */
  static prefetchDomainQuery<
    TData = unknown,
    TError = unknown,
    TQueryKey extends QueryKey = QueryKey
  >(
    options: {
      queryFn: () => Promise<TData>
    } & QueryDomainMeta & Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn' | 'enabled'>
  ): Promise<void> {
    const { queryFn, subdomain, params, ...rest } = options
    const domainArray = 'domains' in options ? options.domains : ('domain' in options ? [options.domain] : [])
    const queryKey = [QM_PREFIX, ...(Array.isArray(domainArray) ? domainArray : []), subdomain, params] as unknown as TQueryKey

    logger.debug('prefetchDomainQuery', queryKey)

    const client = QueryManager.currentClient()
    return client.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 0,
      ...rest
    })
  }

  /**
   * Execute a paginated query with domain-based organization
   * This is a specialized version of domainQuery that handles pagination consistently
   * @param options Query options including domain, subdomain, pagination, and parameters
   * @returns Query result
   */
  static paginatedDomainQuery<
    TData = unknown,
    TError = unknown,
    TQueryKey extends QueryKey = QueryKey
  >(options: PaginationQueryOptions<TData, TError, TQueryKey>): DomainQueryResult<TData, TError> {
    const { pagination, params, ...rest } = options
    const combinedParams = {
      ...params,
      cursor: pagination.cursor,
      limit : pagination.limit
    }

    // Extract domains from the options
    const domainArray = 'domains' in rest ? rest.domains : ('domain' in rest ? [rest.domain] : [])
    
    return QueryManager.domainQuery({
      ...rest,
      domains: Array.isArray(domainArray) ? domainArray : [],
      params: combinedParams
    })
  }

  /**
   * Process a query key to replace undefined/null values with placeholders
   * @param key The query key to process
   * @param context Optional context to include in placeholders (e.g., 'MemberClient-fetchMember')
   * @returns The processed key with placeholders
   */
  private static processKeyWithPlaceholders(key: QueryKey, context?: string): QueryKey {
    if (!Array.isArray(key)) {
      return key === undefined || key === null ? [`ph-${context || 'unknown'}`] : key
    }

    return key.map((part, index) => part ?? `ph-${context || `position-${index}`}`) as QueryKey
  }

  /**
   * Infer domains from a query key
   * @param key The query key to infer domains from
   * @returns Array of inferred domain names
   * @private
   */
  private static inferDomainsFromKey(key: QueryKey): QueryDomainEnum[] {
    if (!Array.isArray(key) || key.length === 0) {
      return []
    }

    const firstPart = key[0]
    if (typeof firstPart !== 'string') {
      return []
    }

    // Check if the first part matches any QueryDomainEnum value
    const upperKey = firstPart.toUpperCase()
    const enumValues = Object.values(QueryDomainEnum)
    return enumValues.includes(upperKey as QueryDomainEnum) ? [upperKey as QueryDomainEnum] : []
  }

  /**
   * Add a query key to a domain
   * @param domainName Name of the domain to add to
   * @param key The query key to add
   */
  private static addToDomain(domainName: QueryDomainEnum, key: QueryKey): void {
    // Use the enum value directly as the key
    QueryManager.domains.has(domainName) ||
      QueryManager.domains.set(domainName, { name: domainName, keys: [] })
    const domain = QueryManager.domains.get(domainName)!
    if (!domain.keys.some(existingKey => JSON.stringify(existingKey) === JSON.stringify(key))) {
      domain.keys.push(key)
    }
  }

  /**
   * Add a query key to a subdomain
   * @param subdomainName Name of the subdomain to add to
   * @param parentDomains Parent domains of this subdomain
   * @param key The query key to add
   */
  private static addToSubdomain(
    subdomainName: string,
    parentDomains: QueryDomainEnum[],
    key: QueryKey
  ): void {
    // Use enum values directly without string conversion
    QueryManager.subdomains.has(subdomainName) ||
      QueryManager.subdomains.set(subdomainName, {
        name: subdomainName,
        parentDomains: parentDomains,
        keys: []
      })
    const subdomain = QueryManager.subdomains.get(subdomainName)!
    if (!subdomain.keys.some(existingKey => JSON.stringify(existingKey) === JSON.stringify(key))) {
      subdomain.keys.push(key)
    }
  }

  /**
   * Clear all queries in the cache
   * This is a direct wrapper for QueryCache.clear()
   * @returns void
   */
  static clearAllQueries(): void {
    QueryManager.currentClient().clear()
    logger.info('Successfully cleared all queries')
  }

  /**
   * Invalidate a specific query key
   * @param key The query key to invalidate
   */
  public static async invalidateKey(key: QueryKey): Promise<void> {
    // Add the QM prefix if it's not already there
    const prefixedKey = QueryManager.addPrefix(key)
    logger.debug(`invalidateKey`, prefixedKey)

    return QueryManager.currentClient()
      .invalidateQueries({ queryKey: prefixedKey })
      .catch(error => {
        logger.error(`Failed to invalidate key:`, { key: prefixedKey, error })
        throw error
      })
  }

  /**
   * Extract parameters object from a query key
   * @param key The query key to extract parameters from
   * @returns The parameters object or null if not found
   * @private
   */
  private static getKeyParameters(key: QueryKey): Record<string, any> | null {
    if (!Array.isArray(key)) return null

    if (key[0] === QM_PREFIX) {
      const paramsObject = key
        .slice(1)
        .find(item => typeof item === 'object' && item !== null && !Array.isArray(item));
      return paramsObject ? (paramsObject as Record<string, any>) : null;
    }

    return null
  }

  /**
   * Deduplicate invalidation targets to avoid redundant invalidations
   * @param options Array of invalidation options to deduplicate
   * @returns Deduplicated array of invalidation options
   * @private
   */
  private static dedupeInvalidations(options: InvalidationOptions[]): InvalidationOptions[] {
    if (options.length <= 1) return options

    const domainLevelInvalidations = new Set<QueryDomainEnum>(
      options
        .filter(option => {
          const hasDomains = 'domains' in option && option.domains && option.domains.length > 0
          const hasDomain = 'domain' in option && option.domain
          return (hasDomains || hasDomain) && !option.subdomain && !option.params
        })
        .map(option => {
          if ('domains' in option && option.domains && option.domains.length > 0) {
            return option.domains[0]
          }
          return ('domain' in option ? option.domain : undefined) as QueryDomainEnum
        })
    );

    return options.filter(option => {
      const primaryDomain = 'domains' in option && option.domains && option.domains.length > 0 
        ? option.domains[0] 
        : ('domain' in option ? option.domain : undefined)
      
      const isRedundantSubdomainInvalidation =
        primaryDomain &&
        option.subdomain &&
        domainLevelInvalidations.has(primaryDomain as QueryDomainEnum) &&
        !option.params;

      return !isRedundantSubdomainInvalidation;
    })
  }

  /**
   * Invalidate queries based on flexible criteria
   * @param options Invalidation options including domain, subdomain, and parameters
   */
  public static async invalidate(options: InvalidationOptions): Promise<void>

  /**
   * Invalidate multiple queries based on flexible criteria
   * @param options Array of invalidation options, each including domain, subdomain, and parameters
   */
  public static async invalidate(options: InvalidationOptions[]): Promise<void>

  /**
   * Implementation of the invalidate method that handles both single options and arrays
   * @param options Single invalidation options or array of options
   */
  public static async invalidate(options: InvalidationOptions | InvalidationOptions[]): Promise<void> {
    // Handle array of options
    if (Array.isArray(options)) {
      if (options.length === 0) {
        logger.warn('Invalidate called with empty options array')
        return Promise.resolve()
      }

      if (options.length === 1) {
        return options[0].refetch ? QueryManager.invalidate(options[0]) : QueryManager.refetch(options[0])
      }

      const deduplicatedOptions = QueryManager.dedupeInvalidations(options);
      logger.debug(
        `invalidate: Processing ${deduplicatedOptions.length} invalidation options (${options.length} originally)`
      );

      return Promise.all(deduplicatedOptions.map(opt => 
        opt.refetch 
          ? QueryManager.refetch(opt) 
          : QueryManager.invalidate(opt))
        )
        .then(() => {});
    }

    // Handle single option (original implementation)
    const queryClient = QueryManager.currentClient()
    const { subdomain, params } = options
    
    // Handle both single domain and array domains from InvalidationOptions
    const domainArray = 'domains' in options ? options.domains : ('domain' in options ? [options.domain] : [])
    const primaryDomain = Array.isArray(domainArray) && domainArray.length > 0 ? domainArray[0] : undefined

    // Build a partial query key based on provided options
    const queryKey: any[] = [
      QM_PREFIX,
      ...(primaryDomain ? [primaryDomain] : []),
      ...(primaryDomain && subdomain ? [subdomain] : []),
    ];

    const invalidationPromise = queryClient.invalidateQueries({
      queryKey,
      predicate: params
        ? query => {
            const queryParams = QueryManager.getKeyParameters(query.queryKey)
            if (!queryParams) return false
            return Object.entries(params).every(([key, value]) => queryParams[key] === value)
          }
        : undefined
    })
    return invalidationPromise
  }

  public static refetch(options: InvalidationOptions): Promise<void> {
    logger.debug('refetch', options)
    // Handle single option (original implementation)
    const queryClient = QueryManager.currentClient()
    const { subdomain, params } = options
    
    // Handle both single domain and array domains from InvalidationOptions
    const domainArray = 'domains' in options ? options.domains : ('domain' in options ? [options.domain] : [])
    const primaryDomain = Array.isArray(domainArray) && domainArray.length > 0 ? domainArray[0] : undefined
    
    const queryKey: any[] = [
      QM_PREFIX,
      ...(primaryDomain ? [primaryDomain] : []),
      ...(primaryDomain && subdomain ? [subdomain] : []),
    ];
    logger.debug('refetch: about to call refetchQueries', {
      queryKey,
      params,
      allQueries: queryClient.getQueryCache().getAll().map(q => ({
        key: q.queryKey,
        params: QueryManager.getKeyParameters(q.queryKey)
      }))
    })
    const refetchPromise = queryClient.refetchQueries({
      queryKey,
      predicate: params
        ? query => {
            const queryParams = QueryManager.getKeyParameters(query.queryKey)
            if (!queryParams) return false
            return Object.entries(params).every(([key, value]) => queryParams[key] === value)
          }
        : undefined
    })
    return refetchPromise
  }

  /**
   * Clean up empty queries in the cache
   * This should be called after the app is fully initialized
   */
  public static cleanupEmptyQueries(): void {
    const queryClient = QueryManager.currentClient()

    const emptyQueries = queryClient
      .getQueryCache()
      .getAll()
      .filter(q => !q.queryKey || (Array.isArray(q.queryKey) && q.queryKey.length === 0))

    if (emptyQueries.length > 0) {
      emptyQueries.forEach(query => queryClient.removeQueries({ queryKey: query.queryKey }))
    }
  }

  /**
   * Perform optimistic updates with error handling and toast notifications
   * @param callbacks Array of functions, function results, or promises to execute (optimistic updates, invalidations, etc.)
   * @param successMessage Optional success message to show in a toast notification
   * @returns Promise that resolves when all operations are complete
   */
  static optimisticUpdate(callbacks: Array<any>, successMessage?: string): Promise<void> {
    logger.debug('QueryManager.optimisticUpdate: Start', { // Updated log
      callbackCount: callbacks.length,
      hasSuccessMessage: !!successMessage,
    });
    
    return new Promise<void>(async (resolve) => { // 'reject' parameter removed as it's not used in this best-effort model
      for (const item of callbacks) {
        try {
          if (typeof item === 'function') {
            await item();
          } else {
            await item;
          }
        } catch (error) {
          logger.error('QueryManager.optimisticUpdate: Error during one of the callback executions.', { error });
        }
      }
      resolve();
    });
  }
}

export { QueryDomainEnum as QueryDomain, QuerySubdomainEnum as QuerySubdomain }
