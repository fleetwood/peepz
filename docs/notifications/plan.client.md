# Notifications: Client Layer

## Status: ✅ **COMPLETED**

## Goal

Build React Query hooks for notification state management. Provides notification hooks for UI consumption.

## Dependencies

- `@peeps/client/fetch/WebRestApi` - HTTP calls with auth token injection
- `@tanstack/react-query` - Caching and state management
- `@peeps/client/QueryManager` - Centralized query management and invalidation

## Files Created ✅

- `packages/client/src/notifications/notifications.client.ts` - Main client with factory pattern
- `packages/client/src/notifications/notification.invalidation.ts` - Query keys and invalidation utilities
- `packages/client/src/notifications/index.ts` - Barrel export
- `packages/client/src/index.ts` - Updated to export notifications

## Implementation Details

### Factory Pattern Architecture

The client uses a factory pattern similar to other clients in the codebase:

```typescript
// Create HTTP client instance
const notificationClient = NotificationClient.createHttp(config)

// Use hooks
const { data: notifications } = notificationClient.useList({ filters: { unreadOnly: true } })
const { data: unreadCount } = notificationClient.useUnreadCount(memberId)
```

### Available Hooks

- `useList(params)` - Paginated notification list with filters
- `useUnreadCount(memberId)` - Unread count with 30s polling
- `useMarkAsRead()` - Mark single notification as read
- `useMarkAllAsRead()` - Mark all notifications as read
- `usePreferences(params)` - Get notification preferences
- `useUpdatePreferences()` - Update notification preferences

### Query Management

Uses `QueryManager` for:
- Consistent query key generation via `NotificationKeys`
- Centralized invalidation via `NotificationInvalidation`
- Domain-based query organization (`QueryDomainEnum.NOTIFS`)

### Integration Points

- **WebRestApi**: Uses client-specific WebRestApi with Supabase token injection
- **QueryManager**: Follows established patterns for cache management
- **Types**: Fully typed with `@peeps/types` notification schemas

## Cross-References

- Implementation: `packages/client/src/notifications/notifications.client.ts`
- Query Management: `packages/client/src/notifications/notification.invalidation.ts`
- Types: `packages/types/src/notifications.ts`
- API Endpoints: `apps/web/app/api/notifications/`

## Next Steps

The client layer is complete. Ready to move to **UI Layer** implementation:
- `NotificationBell` - Header icon with unread badge
- `NotificationDropdown` - Recent notifications list
- `NotificationInbox` - Full page notification center
- `NotificationToast` - Real-time toast notifications

## Notes

- Uses factory pattern consistent with other clients (AuthClient, UserClient, etc.)
- Integrates with QueryManager for centralized cache management
- `useUnreadCount` polls every 30 seconds for real-time updates
- All mutations automatically invalidate relevant queries
- Fully typed with proper error handling
