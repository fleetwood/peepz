# QueryManager Documentation

## Overview

**The QueryManager is a central system that manages all data fetching and caching in the app.** It ensures that when data changes in one part of the app, all related data automatically updates everywhere else. This prevents bugs where different parts of the app show inconsistent information.

## Core Concepts

### Query Domains
**Query domains are like folders that organize different types of data in your app.** Each domain represents a major feature area:

```typescript
export enum QueryDomain {
  FOO  = 'FOO',  // For "foo" feature data
  BAR  = 'BAR',  // For "bar" feature data
  BAZ  = 'BAZ',  // For "baz" feature data
}
```

### Query Subdomains
**Subdomains are like subfolders within each domain.** They help organize different types of queries within the same feature:

```typescript
export enum QuerySubdomain {
  DETAIL = 'detail',  // For single item queries (like viewing one event)
  FEED   = 'feed',    // For list queries (like browsing events)
  STUB   = 'stub',    // For stub/preview data
}
```

## Implementation Pattern

**Here's the step-by-step process to add a new feature's data management to QueryManager:**

### 1. Create Query Keys

**Query keys define the "address" of each piece of data.** Create a keys class for your feature:

```typescript
// src/services/QueryManager/FooInvalidation.ts
export class FooKeys {
   // For getting a single foo's details
   static FooDetailKey = (fooStub: string) => {
      return {
         domain   : QueryDomain.FOO,        // Which feature this belongs to
         subdomain: QuerySubdomain.DETAIL,  // What type of query this is
         params   : { fooStub },            // The specific item to fetch
      }
   }

   // For getting related foo and bar data together
   static FooBarKey = (fooStub: string, barStub: string) => {
      return {
         domain   : QueryDomain.FOO,
         subdomain: QuerySubdomain.DETAIL,
         params   : { fooStub, barStub },   // Multiple parameters
      }
   }

   // For getting a list of foos
   static FooFeedKey = () => {
      return {
         domain   : QueryDomain.FOO,
         subdomain: QuerySubdomain.FEED,    // List queries use FEED subdomain
      }
   }

   // For paginated foo lists (page 1, 2, 3...)
   static FooFeedPaginated = (page: number, pageSize: number, params?: any) => {
      return {
         domain    : QueryDomain.FOO,
         subdomain : QuerySubdomain.FEED,
         pagination: { page, limit: pageSize },  // Page info for pagination
         params,                                     // Additional filters
      }
   }
}
```

### 2. Create Invalidation Methods

**Invalidation methods tell QueryManager when to refresh data.** For every query key, create matching invalidate/refetch methods:

```typescript
export class FooInvalidation {

  // INVALIDATE methods clear the cache (data will be refetched when needed)
  static invalidateFooDetail(fooStub: string) {
    logger.debug('🔄 invalidateFooDetail', { fooStub })
    return QueryManager.invalidate(FooKeys.FooDetailKey(fooStub))
  }

  // REFETCH methods clear cache AND immediately fetch fresh data
  static refetchFooDetail(fooStub: string) {
    logger.debug('🔄 refetchFooDetail', { fooStub })
    return QueryManager.refetch(FooKeys.FooDetailKey(fooStub))
  }

  // For queries that need multiple parameters
  static invalidateFooBar(fooStub: string, barStub: string) {
    logger.debug('🔄 invalidateFooBar', { fooStub, barStub })
    return QueryManager.invalidate(FooKeys.FooBarKey(fooStub, barStub))
  }

  static refetchFooBar(fooStub: string, barStub: string) {
    logger.debug('🔄 refetchFooBar', { fooStub, barStub })
    return QueryManager.refetch(FooKeys.FooBarKey(fooStub, barStub))
  }

  // For list queries (no parameters needed)
  static invalidateFooFeed() {
    logger.debug('🔄 invalidateFooFeed')
    return QueryManager.invalidate(FooKeys.FooFeedKey())
  }

  static refetchFooFeed() {
    logger.debug('🔄 refetchFooFeed')
    return QueryManager.refetch(FooKeys.FooFeedKey())
  }

  // For paginated queries - invalidate ALL pages at once
  static invalidateFooFeedPaginated() {
    logger.debug('🔄 invalidateFooFeedPaginated')
    return QueryManager.invalidate(FooKeys.FooFeedPaginated())
  }

  // Or refetch a specific page if needed
  static refetchFooFeedPaginated(page: number, pageSize: number, params?: any) {
    logger.debug('🔄 refetchFooFeedPaginated', { page, pageSize, params })
    return QueryManager.refetch(FooKeys.FooFeedPaginated(page, pageSize, params))
  }

}
```

### 3. Create Hook Functions

**Hooks are the functions your React components use to fetch data.** Create these in your feature's service file:

```typescript
// src/services/Foos/FooClient.ts

// Hook for single foo details
export const useFooDetail = (fooStub: string) => {
  return QueryManager.domainQuery<FooDetailType, Error>({
    ...FooKeys.FooDetailKey(fooStub),     // Use the query key we defined
    queryFn  : () => fetchFooDetail(fooStub),  // Your data fetching function
    enabled  : !!fooStub,                  // Only fetch when fooStub exists
    staleTime: 1000 * 60 * 5,              // Cache for 5 minutes (optional)
  })
}

// Hook for combined foo and bar data
export const useFooBar = (fooStub: string, barStub: string) => {
  return QueryManager.domainQuery<FooBarType, Error>({
    ...FooKeys.FooBarKey(fooStub, barStub),
    queryFn  : () => fetchFooBar(fooStub, barStub),
    enabled  : !!fooStub && !!barStub      // Only fetch when both exist
  })
}

// Hook for foo list
export const useFooFeed = () => {
  return QueryManager.domainQuery<FooFeedType, Error>({
    ...FooKeys.FooFeedKey(),
    queryFn  : () => fetchFooFeed(),
    enabled  : true,                       // Always fetch (no conditions)
    staleTime: 1000 * 60 * 5,
  })
}

// Hook for paginated foo list
const { data, isLoading, error, status } = QueryManager.paginatedDomainQuery<FooFeedType, Error>({
    ...FooKeys.FooFeedPaginated(page, pageSize, canQuery ? feedProps : { dummy: 'placeholder' }),
    // Set staleTime to 0 to ensure it refetches when invalidated
    staleTime: 0,
    // Optional, refetches on window focus
    refetchOnWindowFocus: true,
    queryFn: () => {
      logger.debug('Fetching foo feed', feedProps)
      return fetchFooFeed({
        ...feedProps,
        page,
        pageSize,
        feedType
      })
    },
    // Optional, only enable paginated query when specific conditions are met
    enabled: canQuery && props.requiredCondition
  })

```

**For paginated data that supports infinite scroll:**

```typescript

  const pageLimit = params?.limit ?? 12
  const props = useParams()

  const {
    data: infiniteFoo,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading
  } = useInfiniteQuery({
    queryKey: infiniteFooQueryKey, 
    queryFn: ({ pageParam = 1 }) =>
      fetchFooFeed({
          ...props,
        limit,
        pagination: {
            page: pageParam,
          limit: pageLimit
        }
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
        if (!lastPage.data?.hasMore) return undefined
      return lastPage.data?.page + 1
    },
    // Optional, set staleTime to 0 to refetch when invalidated
    staleTime: 0,
    // Optional, refetches on window focus
    refetchOnWindowFocus: true,
    // Optional, enable the query only when a required condition is satisfied
    enabled: !!props.someFoo 
  })

  const foos = useMemo(() => {
    if (!infiniteFoo?.pages) return []
    return infiniteFoo.pages.flat()
  }, [infiniteFoo?.pages])

  // values for provider or hook
  return {
    foos,
    foosLoading: isInfiniteLoading,
    foosError  : error?.message ?? null,
    currentPage: infiniteFoo?.pages?.length ?? 1,
    hasNextPage,
    hasPrevPage: false,
    nextPage   : () => hasNextPage && !isFetchingNextPage && fetchNextPage(),
    prevPage   : () => {},                                                      // Not supported in infinite scroll
    setPage    : () => {},                                                      // Not supported in infinite scroll
    refetchFoos: refetch,
  }

```

## Domain Hierarchy & Invalidation Levels

**QueryManager uses a three-tier hierarchy for query organization and invalidation:**

```
DOMAIN → Subdomain → Key(Parameters)
  ↑        ↑           ↑
  |        |           |
Broad  Specific    Exact Match
```

### **Level 1: Domain Invalidation**
**Invalidates ALL queries within a domain** (most broad impact)

```typescript
// ❌ AVOID: Invalidates EVERY query in EVENTS domain
QueryManager.invalidate({
  domain: QueryDomain.EVENTS
})

// Use case: Only when you need to clear ALL event-related data
// (e.g., user logs out, major app reset)
```

### **Level 2: Domain + Subdomain Invalidation**
**Invalidates all queries matching domain AND subdomain** (medium impact)

```typescript
// ❌ AVOID: Invalidates ALL detail queries in EVENTS domain
QueryManager.invalidate({
  domain   : QueryDomain.EVENTS,
  subdomain: QuerySubdomain.DETAIL  // ✅ Use enum constant, not hardcoded string
})

// Use case: Only when you need to clear a specific query type
// (e.g., changing detail view structure for all events)
```

### **Level 3: Specific Key Invalidation (Recommended)**
**Invalidates only queries with exact matching parameters** (precise impact)

```typescript
// ✅ RECOMMENDED: Only invalidates this specific event
QueryManager.invalidate(EventKeys.EventDetailKey('event-123'))

// ✅ RECOMMENDED: Only invalidates infinite feed with these filters
QueryManager.invalidate(EventKeys.EventFeedInfinite({ category: 'writing' }))
```

### **When to Use Each Level**

| Level | Use Case | Impact | Performance |
|-------|----------|--------|-------------|
| **Domain** | App-wide reset, user logout | 🚨 Very High | ❌ Poor |
| **Domain+Subdomain** | Schema changes, major updates | ⚠️ High | ⚠️ Poor |
| **Key (Recommended)** | Normal mutations, data updates | ✅ Precise | ✅ Good |

### **Best Practice: Use Key-Level Invalidation**

**In 95% of cases, invalidate at the KEY level:**

```typescript
// ✅ After updating an event
await updateEventAction({ stub: eventStub, ...updates })
EventInvalidation.invalidateEventDetail(eventStub)  // Specific key

// ✅ After creating a new event  
await createEventAction(newEventData)
EventInvalidation.invalidateEventFeed()  // List key (no params)

// ❌ Don't do this unless necessary
QueryManager.invalidate({ domain: QueryDomain.EVENTS })  // Too broad!
```

### **Why Key-Level is Better**

1. **Performance**: Only refetches affected queries
2. **Precision**: Doesn't unnecessarily refresh unrelated data
3. **User Experience**: Faster updates, less loading states
4. **Debugging**: Clear which queries are being invalidated

### **When to Use Broader Invalidation**

**Only use domain/subdomain invalidation when:**
- Schema changes require complete refresh
- Major app state changes (login/logout)
- Emergency cache clearing
- Testing/debugging purposes

**Always prefer the most specific invalidation level possible!** 🎯

## Usage Examples

### Basic Query Hook

**In your React components, use the hooks like this:**

```typescript
// In a React component
const [FeatureName]DetailComponent = ({ identifier }: { identifier: string }) => {
  const { data: item, isLoading, error } = use[FeatureName]Detail(identifier)

  return(
    <AsyncContainer isLoading={[isLoading]} error={[error]}>
        {item.name}  {/* Display the data */}
    </AsyncContainer>
)}

// Component that uses multiple related queries
const [FeatureName]BarComponent = ({ fooStub, barStub }: { fooStub: string, barStub: string }) => {
  const { data: fooBar, isLoading: fooBarLoading, error: fooBarError } = useFooBar(fooStub, barStub)
  const {data: fooFeed, isLoading: fooFeedLoading, error: fooFeedError } = useFooFeed()

  return(
    <AsyncContainer isLoading={[fooBarLoading, fooFeedLoading]} error={[fooBarError, fooFeedError]}>
        {fooBar.name}                           {/* Show combined data */}
        {fooFeed.map(f => <div key={f.id}>{f.name}</div>)}  {/* Show list */}
    </AsyncContainer>
)}
```

### Invalidation After Mutations

**When you update data, call the invalidation methods to refresh related queries:**

```typescript
// After creating/updating a [feature]
const handle[FeatureName]Update = async (identifier: string, updates: UpdateData) => {
  try {
    await update[FeatureName]Action({ id: identifier, ...updates })

    // Invalidate related queries so they refetch with new data
    [FeatureName]Invalidation.invalidate[FeatureName]Detail(identifier)  // Refresh detail page
    [FeatureName]Invalidation.invalidate[FeatureName]Feed()              // Refresh list (in case order changed)

    // Show success message
  } catch (error) {
    // Handle error
  }
}
```

### Infinite Scroll Queries

**For paginated data that supports infinite scroll:**

```typescript
export const use[FeatureName]Client = (params?: [FeatureName]Filters) => {
  const pageLimit = params?.limit ?? 12

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading
  } = useInfiniteQuery({
    queryKey: [FeatureName]Keys.[FeatureName]InfiniteKey(params),        // Use proper query key!
    // Set staleTime to 0 to ensure it refetches when invalidated
    staleTime: 0,
    // Ensure it refetches on window focus
    refetchOnWindowFocus: true,
    queryFn: ({ pageParam = 1 }) =>
      fetch[FeatureName]Feed({
        ...params,
        limit: pageLimit,
        pagination: {
          page: pageParam,
          limit: pageLimit
        }
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (!lastPage.data?.hasMore) return undefined  // No more pages
      return lastPage.data?.page + 1                 // Next page number
    },
    enabled: !!params?.someFilter // optional as needed
  })

  const items = useMemo(() => {
    if (!infiniteData?.pages) return []
    return infiniteData.pages.flat()
  }, [infiniteData?.pages])

  return {
    items,
    itemsLoading: isInfiniteLoading,
    itemsError: error?.message ?? null,
    currentPage: infiniteData?.pages?.length ?? 1,
    hasNextPage,
    hasPrevPage: false,
    nextPage: () => hasNextPage && !isFetchingNextPage && fetchNextPage(),
    prevPage: () => {}, // Not supported in infinite scroll
    setPage: () => {},  // Not supported in infinite scroll
    refetchItems: refetch,
  }
}
```

## Complete Implementation Example

**Here's how to implement QueryManager for any feature using the generic pattern:**

### 1. Query Keys (FeatureInvalidation.ts)
```typescript
export class [FeatureName]Keys {
  static [FeatureName]DetailKey(identifier: string) {
    return {
      domain   : QueryDomain.[APPROPRIATE_DOMAIN],
      subdomain: QuerySubdomain.DETAIL,
      params   : { identifier, key: '[feature]-detail' }  // ✅ Key differentiator
    }
  }

  static [FeatureName]FeedKey(filters?: any) {
    return {
      domain   : QueryDomain.[APPROPRIATE_DOMAIN],
      subdomain: QuerySubdomain.FEED,
      params   : { ...filters, key: '[feature]-feed' }    // ✅ Key differentiator
    }
  }

  static [FeatureName]InfiniteKey(filters?: any) {
    return {
      domain   : QueryDomain.[APPROPRIATE_DOMAIN],
      subdomain: QuerySubdomain.FEED,
      params   : { ...filters, key: '[feature]-infinite' } // ✅ Key differentiator
    }
  }
}
```

### 2. Invalidation Methods
```typescript
export class [FeatureName]Invalidation {
  static invalidate[FeatureName]Detail(identifier: string) {
    logger.debug('🔄 Invalidating [feature] detail', { identifier })
    return QueryManager.invalidate([FeatureName]Keys.[FeatureName]DetailKey(identifier))
  }

  static refetch[FeatureName]Detail(identifier: string) {
    logger.debug('🔄 Refetching [feature] detail', { identifier })
    return QueryManager.refetch([FeatureName]Keys.[FeatureName]DetailKey(identifier))
  }

  static invalidate[FeatureName]Feed(filters?: any) {
    logger.debug('🔄 Invalidating [feature] feed', { filters })
    return QueryManager.invalidate([FeatureName]Keys.[FeatureName]FeedKey(filters))
  }

  static invalidate[FeatureName]Infinite(filters?: any) {
    logger.debug('🔄 Invalidating [feature] infinite', { filters })
    return QueryManager.invalidate([FeatureName]Keys.[FeatureName]InfiniteKey(filters))
  }
}
```

### 3. Hook Functions (FeatureClient.ts)
```typescript
export const use[FeatureName]Detail = (identifier: string) => {
  return QueryManager.domainQuery<[FeatureName]DetailType, Error>({
    ...[FeatureName]Keys.[FeatureName]DetailKey(identifier),
    queryFn  : () => fetch[FeatureName]Detail(identifier),
    enabled  : !!identifier,
    staleTime: 1000 * 60 * 5,
  })
}

export const use[FeatureName]Infinite = (filters?: any) => {
  return useInfiniteQuery({
    queryKey: [[FeatureName]Keys.[FeatureName]InfiniteKey(filters)],  // ✅ Use [FeatureName]Keys class
    queryFn: ({ pageParam = 1 }) => fetch[FeatureName]Feed({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.length < limit ? undefined : lastPage.length + 1,
    staleTime: 0,
    refetchOnWindowFocus: true
  })
}
```

## Best Practices

### 1. Consistent Naming
- **Query Keys**: `[Entity][Description]Key` (e.g., `EventDetailKey`, `UserProfileKey`)
- **Invalidation Methods**: `invalidate[Entity][Description]` and `refetch[Entity][Description]`
- **Parameters**: Use consistent names like `id`, `stub`, `slug` based on your data structure

### 2. Proper Domain Selection
- **Choose the right domain** for your feature area from `QueryDomain` enum
- **Use the most specific domain** available for your data type
- **Check existing domains** in `src/types/queryManager.ts` before adding new ones

### 3. Use Enum Constants (Not Hardcoded Strings)
**Always use `QuerySubdomain` enum constants instead of hardcoded strings:**

```typescript
// ✅ CORRECT: Use enum constant
subdomain: QuerySubdomain.DETAIL

// ❌ WRONG: Hardcoded string
subdomain: 'detail' as QuerySubdomain

// ❌ WRONG: Implementation-specific string
subdomain: 'event-detail' as QuerySubdomain
```

**Why enum constants are better:**
- **Type Safety**: TypeScript will catch typos at compile time
- **Consistency**: All queries use the same predefined values
- **Maintainability**: Easy to refactor if subdomain names change
- **IDE Support**: Auto-completion and refactoring tools work properly

### 4. Key Differentiators (Prevent Cache Conflicts)
**Always include key differentiators in query parameters to prevent cache conflicts:**

```typescript
// ✅ GOOD: Each query has unique parameters
EventDetailKey(eventId, 'goal')     // params: { eventId, eventType: 'goal', key: 'event-detail-goal' }
ScheduledPostsKey(eventId)          // params: { eventId, key: 'scheduled-posts' }
ActivePostKey(eventId)              // params: { eventId, key: 'active-post' }

// ❌ BAD: These would conflict and overwrite each other
EventDetailKey(eventId)             // params: { eventId }
ScheduledPostsKey(eventId)          // params: { eventId }  ← Same params!
ActivePostKey(eventId)              // params: { eventId }  ← Same params!
```

**Key differentiators ensure:**
- **Unique cache entries** for each query type
- **Precise invalidation** targeting only the intended queries
- **No accidental data conflicts** between different features

### 5. Error Handling
```typescript
// Always handle errors in query functions
const fetch[FeatureName]Detail = async (identifier: string) => {
  const result = await get[FeatureName]Detail({ identifier })

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch [feature] detail')
  }

  return result.data
}
```

### 6. Logging
```typescript
// In query functions
logger.debug('Fetching [feature] detail', { identifier })

// In invalidation methods
logger.debug('🔄 Invalidating [feature] detail', { identifier })
logger.error('Failed to fetch [feature] detail', error, { identifier })
```

## Testing

**Mock QueryManager in tests:**

```typescript
// Mock the QueryManager
jest.mock('@/services/QueryManager', () => ({
  QueryManager: {
    domainQuery: jest.fn(),
    invalidate: jest.fn(),
  }
}))

// Mock specific hooks
jest.mock('@/services/[FeatureName]/[FeatureName]Client', () => ({
  use[FeatureName]Detail: jest.fn(),
  use[FeatureName]Infinite: jest.fn(),
}))
```

## Troubleshooting

### Common Issues

1. **Invalidation not working**
   - ✅ Check that you're using the same key in both query and invalidation
   - ✅ Verify the key includes all required parameters
   - ✅ Check browser console for error messages

2. **Wrong domain**
   - ✅ Use the appropriate `QueryDomain` constant for your feature area
   - ✅ Check `src/types/queryManager.ts` for available domains
   - ✅ Never use plain strings, always use domain constants

3. **Missing parameters**
   - ✅ Ensure all required parameters are provided to key functions
   - ✅ Check that parameter names match between query and invalidation

4. **Hardcoded strings instead of enum constants**
   - ✅ Use `QuerySubdomain.DETAIL` instead of `'detail' as QuerySubdomain`
   - ✅ Use `QuerySubdomain.FEED` instead of `'feed' as QuerySubdomain`
   - ✅ Check `src/types/queryManager.ts` for available enum values

5. **Stale data**
   - ✅ Reduce `staleTime` for frequently changing data
   - ✅ Use `refetch` instead of `invalidate` for immediate updates

### Debug Logging
Enable debug logging to see query operations:

```typescript
// In development
const logger = Logger.instance('[FeatureName]Client', true) // Enable logging

logger.debug('Fetching [feature] data', { page, filters })
logger.error('Failed to fetch [feature] data', error, { page, filters })
```

## Migration Guide

### Before (Inconsistent)
```typescript
// Hardcoded query structures in invalidation methods
QueryManager.invalidate({
  domain   : QueryDomain.GOALS,
  subdomain: QuerySubdomain.DETAIL,  // ✅ Use enum constant, not hardcoded string
  params   : { identifier }
})
```

### After (Consistent)
```typescript
// ✅ Using [FeatureName]Keys class for consistency
QueryManager.invalidate([FeatureName]Keys.[FeatureName]DetailKey(identifier))

// ✅ Key differentiators prevent cache conflicts
[FeatureName]Keys.EventDetailKey(eventId, 'goal')     // Different from prompt events
[FeatureName]Keys.ScheduledPostsKey(eventId)         // Different from participants
[FeatureName]Keys.ActivePostKey(eventId)             // Different from scheduled posts
```

## Future Enhancements

- [ ] Query performance monitoring
- [ ] Automatic dependency tracking
- [ ] Query result caching strategies
- [ ] Batch invalidation operations
- [ ] Query analytics and metrics

This pattern ensures **consistent, reliable data management** across your entire application! 🎯✨
