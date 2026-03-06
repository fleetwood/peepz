import { useQuery } from '@tanstack/vue-query'
import { Logger } from '@peeps/utils'
import type { 
  DomainQueryOptions, 
  PaginationQueryOptions,
  QueryKey 
} from '@peeps/types'
import { computed, unref, type MaybeRef } from 'vue'

const logger = Logger.instance('useQueryManager', false)

/**
 * Vue composable wrapper for QueryManager.domainQuery
 * Converts React Query's useQuery to Vue Query's useQuery
 */
export function useDomainQuery<TData = unknown, TError = unknown>(
  options: MaybeRef<DomainQueryOptions<TData, TError, any>>
) {
  const queryKey = computed(() => {
    const currentOpts = unref(options)
    const currentEnabled = currentOpts.enabled ?? true
    
    if (!currentEnabled) {
      return ['QM', 'disabled']
    }

    try {
      const domainArray = 'domains' in currentOpts 
        ? currentOpts.domains 
        : ('domain' in currentOpts ? [currentOpts.domain] : [])
      
      return ['QM', ...(domainArray ?? []), currentOpts.subdomain, currentOpts.params].filter(Boolean)
    } catch (error) {
      logger.warn('Failed to register query key, using fallback', { error })
      return ['QM', 'fallback']
    }
  })

  return useQuery({
    queryKey: queryKey as any,
    queryFn: (context) => {
      const currentOpts = unref(options)
      logger.debug('queryFn', { queryKey: queryKey.value, queryFn: currentOpts.queryFn })
      return currentOpts.queryFn({
        queryKey: context.queryKey,
        signal: context.signal,
        meta: {
          params: currentOpts.params
        }
      })
    },
    enabled: computed(() => unref(options).enabled ?? true),
    ...(unref(options) as any)
  })
}

/**
 * Vue composable wrapper for QueryManager.paginatedDomainQuery
 * Handles pagination consistently with QueryManager patterns
 */
export function usePaginatedDomainQuery<TData = unknown, TError = unknown>(
  options: MaybeRef<PaginationQueryOptions<TData, TError, any>>
) {
  const opts = computed(() => {
    const currentOpts = unref(options)
    const { pagination, params, ...rest } = currentOpts
    
    const combinedParams = {
      ...params,
      ...(pagination || {})
    }

    const domainArray = 'domains' in rest ? rest.domains : ('domain' in rest ? [rest.domain] : [])
    
    return {
      ...rest,
      domains: Array.isArray(domainArray) ? domainArray : [],
      params: combinedParams
    }
  })

  return useDomainQuery(opts as any)
}
