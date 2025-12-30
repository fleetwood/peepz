# CLIENT CODE JSDOC Rules

**IMPORTANT:** Client code (hooks, components, providers) should be clean, concise, and follow QueryManager patterns.

## General Documentation Rules

Use md and jsdoc formatting. Use @link to link to external files or type definitions.

1. Explain what the hook/component does
2. List QueryManager operations (queries, mutations, invalidations)
3. List external calls/dependencies
4. Document params with type links
5. Include Query Scope tracking

## QueryManager Usage Rules

### 1. Query Keys
**ALWAYS use the appropriate Keys class for query keys:**

```typescript
// ✅ CORRECT: Use Keys class
const { data } = QueryManager.domainQuery({
  ...StoryKeys.StoryDetailKey(storyId),
  queryFn: () => fetchStory(storyId)
})

// ❌ WRONG: Manual key construction
const { data } = useQuery({
  queryKey: ['story', storyId],  // Don't do this!
  queryFn: () => fetchStory(storyId)
})
```

### 2. Invalidation
**ALWAYS use Invalidation class methods:**

```typescript
// ✅ CORRECT: Use Invalidation class
onSuccess: () => {
  StoryInvalidation.invalidateStoryDetail(storyId)
  StoryInvalidation.refetchUserStories(userId)
}

// ❌ WRONG: Direct QueryManager calls
onSuccess: () => {
  QueryManager.invalidate({ domain: QueryDomain.STORIES })  // Too broad!
}
```

### 3. Query Options
**Set appropriate staleTime and refetch behavior:**

```typescript
// For frequently changing data
QueryManager.domainQuery({
  ...EventKeys.EventDetailKey(eventId),
  staleTime: 0,  // Always refetch when invalidated
  refetchOnWindowFocus: true,
  queryFn: () => fetchEvent(eventId)
})

// For stable data
QueryManager.domainQuery({
  ...UserKeys.UserProfileKey(userId),
  staleTime: 1000 * 60 * 5,  // Cache for 5 minutes
  queryFn: () => fetchUser(userId)
})
```

### 4. Infinite Queries
**Use proper queryKey generation for infinite scroll:**

```typescript
// ✅ CORRECT: Use Keys class for infinite queries
const infiniteQueryKey = useMemo(() => {
  const keyOptions = FeedKeys.infiniteFeed({ ...params, infinite: true })
  return ['QM', keyOptions.domain, keyOptions.subdomain, keyOptions.params]
}, [params])

const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: infiniteQueryKey,
  staleTime: 0,
  refetchOnWindowFocus: true,
  queryFn: ({ pageParam = 1 }) => fetchFeed({ ...params, page: pageParam }),
  initialPageParam: 1,
  getNextPageParam: (lastPage) => 
    lastPage.data?.hasMore ? lastPage.data.page + 1 : undefined
})
```

## Documentation Template

### For Simple Query Hooks

```typescript
/**
 * Fetches story detail data.
 * 
 * QueryManager Operations:
 * - Query: {@link StoryKeys.StoryDetailKey}
 * 
 * @param storyId - {@link Story} identifier
 * @returns Query result with story data, loading state, and error
 * 
 * Query Scope:
 * - keys: 1 (StoryDetailKey)
 * - invalidations: StoryInvalidation.invalidateStoryDetail
 * - clean: ✅ uses proper Keys class
 */
export const useStoryDetail = (storyId: string) => {
  return QueryManager.domainQuery({
    ...StoryKeys.StoryDetailKey(storyId),
    queryFn: () => fetchStory(storyId),
    enabled: !!storyId
  })
}
```

### For Mutation Hooks

```typescript
/**
 * Creates a new story with proper invalidation.
 * 
 * QueryManager Operations:
 * - Mutation: createStory
 * - Invalidation: {@link StoryInvalidation.refetchUserStories}
 * 
 * External Calls:
 * - {@link createStoryAction} (server action)
 * 
 * @returns Mutation function and state
 * 
 * Query Scope:
 * - mutations: 1 (createStory)
 * - invalidations: 1 (refetchUserStories)
 * - clean: ✅ uses Invalidation class
 */
const { mutateAsync: create } = useMutation({
  mutationFn: createStory,
  onSuccess: async () => {
    toast.success('Story created!')
    await StoryInvalidation.refetchUserStories(userId)
  },
  onError: (error) => {
    toast.error(error.message)
  }
})
```

### For Complex Infinite Query Hooks

```typescript
/**
 * Manages infinite scroll feed with pagination.
 * 
 * QueryManager Operations:
 * - Infinite Query: {@link FeedKeys.infiniteFeed}
 * - Invalidation: {@link FeedInvalidation.invalidateInfiniteFeed}
 * 
 * Query Options:
 * - staleTime: 0 (always refetch when invalidated)
 * - refetchOnWindowFocus: true
 * - enabled: conditional based on props
 * 
 * @param props - {@link PostFeedProps} feed configuration
 * @returns Feed data, pagination controls, and loading states
 * 
 * Query Scope:
 * - keys: 1 (infiniteFeed with dynamic params)
 * - invalidations: FeedInvalidation.invalidateInfiniteFeed
 * - complexity: ⚠️ manual queryKey construction (necessary for infinite scroll)
 * - clean: ✅ uses proper Keys class pattern
 * 
 * Note: Manual queryKey construction required for useInfiniteQuery compatibility.
 * Follows QueryManager pattern: ['QM', domain, subdomain, params]
 */
export const usePostFeed = (props: PostFeedProps) => {
  const queryParams = useMemo(() => ({
    type: feedType,
    feedType: props.feedType,
    memberId: props.memberId,
    hashtag,
    limit: pageLimit,
    mini: props.mini
  }), [feedType, props.feedType, props.memberId, hashtag, pageLimit, props.mini])

  // Generate QueryManager key for infinite query
  const infiniteQueryKey = useMemo(() => {
    const keyOptions = PaginatedFeedKeys.infiniteFeed({ ...queryParams, infinite: true })
    return ['QM', keyOptions.domain, keyOptions.subdomain, keyOptions.params]
  }, [queryParams])

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: infiniteQueryKey,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: ({ pageParam = 1 }) => fetchFeed({ ...props, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.data?.hasMore ? lastPage.data.page + 1 : undefined,
    enabled: !props.mini
  })
  
  // ... rest of implementation
}
```

## Query Scope Tracking

Track these aspects for client code:

1. **keys**: Number and types of query keys used
2. **mutations**: Number of mutations
3. **invalidations**: Which invalidation methods are called
4. **complexity**: Flag if manual key construction is needed
5. **clean**: ✅ if follows QueryManager patterns, ⚠️ if has necessary complexity, ❌ if violates patterns

## Anti-Patterns to Avoid

### ❌ Manual Query Keys
```typescript
// DON'T: Hardcoded query keys
useQuery({
  queryKey: ['events', eventId],
  queryFn: () => fetchEvent(eventId)
})
```

### ❌ Broad Invalidation
```typescript
// DON'T: Invalidate entire domains
QueryManager.invalidate({ domain: QueryDomain.EVENTS })
```

### ❌ Missing Invalidation
```typescript
// DON'T: Mutate without invalidating
useMutation({
  mutationFn: updateEvent,
  onSuccess: () => {
    toast.success('Updated!')
    // Missing: EventInvalidation.invalidateEventDetail(eventId)
  }
})
```

### ❌ Unnecessary Logic
```typescript
// DON'T: Add complex state management when QueryManager handles it
const [data, setData] = useState()
const [loading, setLoading] = useState(true)

// Just use QueryManager!
const { data, isLoading } = QueryManager.domainQuery(...)
```

## Best Practices

1. **Keep it simple**: Let QueryManager handle caching, loading states, and refetching
2. **Use Keys classes**: Always use the appropriate Keys class for query keys
3. **Use Invalidation classes**: Always use Invalidation class methods
4. **Set staleTime appropriately**: 0 for dynamic data, higher for stable data
5. **Document complexity**: If manual queryKey construction is needed, explain why
6. **Follow patterns**: Use the examples from QueryManager.md as templates