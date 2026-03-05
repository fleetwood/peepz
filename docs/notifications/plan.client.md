# Notifications: Client Layer

## Goal

Build React Query hooks for notification state management. Provides `useNotifications`, `useMarkAsRead`, and `useNotificationPreferences` for UI consumption.

## Dependencies

- `@peeps/utils/fetch/web` - `WebRestApi` for HTTP calls
- `@tanstack/react-query` - Caching and state management
- `@peeps/client/QueryManager` - Invalidation utilities

## Files to Create

- `packages/client/src/notifications/notifications.client.ts` - Main client
- Update `packages/client/src/index.ts` - Export

## NotificationClient API

### useNotifications Hook

```typescript
// packages/client/src/notifications/notifications.client.ts
export function useNotifications(options?: { unreadOnly?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ['notifications', options?.unreadOnly ? 'unread' : 'all', options?.limit ?? 20],
    queryFn: async () => {
      const unreadParam = options?.unreadOnly ? 'unreadOnly=true' : ''
      const limitParam = options?.limit ? `limit=${options.limit}` : ''
      const params = [unreadParam, limitParam].filter(Boolean).join('&')
      
      const { data, error, status, statusText } = await WebRestApi.fetch<{ notifications: Notification[] }>(
        `/api/notifications${params ? `?${params}` : ''}`
      )
      
      if (error || !data) {
        throw new Error(`Failed to fetch notifications: ${status} ${statusText}`)
      }
      
      return data.notifications
    },
  })
}
```

### useUnreadCount Hook

```typescript
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data, error, status, statusText } = await WebRestApi.fetch<{ count: number }>(
        '/api/notifications?unreadOnly=true&limit=0&count=true'
      )
      
      if (error || !data) {
        throw new Error(`Failed to fetch unread count: ${status} ${statusText}`)
      }
      
      return data.count
    },
    // Poll every 30 seconds for new notifications
    refetchInterval: 30000,
  })
}
```

### useMarkAsRead Hook

```typescript
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error, status, statusText } = await WebRestApi.post<{ notification: Notification }>(
        `/api/notifications/${notificationId}/read`,
        {}
      )
      
      if (error || !data) {
        throw new Error(`Failed to mark as read: ${status} ${statusText}`)
      }
      
      return data.notification
    },
    onSuccess: () => {
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
```

### useMarkAllAsRead Hook

```typescript
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const { data, error, status, statusText } = await WebRestApi.post<{ success: boolean }>(
        '/api/notifications/read-all',
        {}
      )
      
      if (error || !data) {
        throw new Error(`Failed to mark all as read: ${status} ${statusText}`)
      }
      
      return data.success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
```

### useNotificationPreferences Hook

```typescript
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data, error, status, statusText } = await WebRestApi.fetch<{ preferences: NotificationPreferences }>(
        '/api/notifications/preferences'
      )
      
      if (error || !data) {
        throw new Error(`Failed to fetch preferences: ${status} ${statusText}`)
      }
      
      return data.preferences
    },
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const { data, error, status, statusText } = await WebRestApi.put<{ preferences: NotificationPreferences }>(
        '/api/notifications/preferences',
        updates
      )
      
      if (error || !data) {
        throw new Error(`Failed to update preferences: ${status} ${statusText}`)
      }
      
      return data.preferences
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    },
  })
}
```

## Real-time Hook (Socket Integration)

```typescript
export function useRealtimeNotifications(onNewNotification?: (notif: Notification) => void) {
  // Get current member ID from auth context
  const { memberId } = useAuth()
  
  useEffect(() => {
    if (!memberId) return
    
    // Subscribe to notifications topic
    const topic = `POST/notifications/${memberId}`
    
    const unsubscribe = SocketClient.subscribe(topic, (payload) => {
      const notification = payload as Notification
      onNewNotification?.(notification)
    })
    
    return () => {
      unsubscribe()
    }
  }, [memberId, onNewNotification])
}
```

## Index Export

Update `packages/client/src/index.ts`:

```typescript
// packages/client/src/index.ts
export {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useRealtimeNotifications,
} from './notifications/notifications.client'
```

## Cross-References

- WebRestApi: `packages/utils/src/fetch/web.ts`
- SocketClient: `packages/client/src/socket/SocketClient.ts`
- Types: `packages/types/src/notifications.ts`

## Notes

- Hooks follow React Query patterns for caching and invalidation
- `useUnreadCount` polls every 30 seconds
- `useRealtimeNotifications` integrates with SocketClient for instant updates
- All hooks handle loading/error states
