# Notifications: API Layer

## Goal

Build REST endpoints for notification operations: listing, marking read, and preferences. Uses `ApiRoute` for validation and auth.

## Dependencies

- `@peeps/services/NotificationService` - Business logic
- `@peeps/types` - `CreateNotificationInputSchema`, `NotificationPreferencesSchema`
- `apps/web/src/lib/api/ApiRoute.ts` - Route handler

## Files Created

- `apps/web/app/api/notifications/route.ts` - List notifications with pagination
- `apps/web/app/api/notifications/[id]/read/route.ts` - Mark single as read
- `apps/web/app/api/notifications/read-all/route.ts` - Mark all as read
- `apps/web/app/api/notifications/preferences/route.ts` - Get/update preferences

## Implementation

See actual implementation files: 

- **List Notifications** : `apps/web/app/api/notifications/route.ts` - Uses `NotificationService.getForMember()` with cursor pagination
- **Mark Single as Read**: `apps/web/app/api/notifications/[id]/read/route.ts` - Uses `NotificationService.markAsRead()`
- **Mark All as Read**   : `apps/web/app/api/notifications/read-all/route.ts` - Uses `NotificationService.markAllAsRead()`
- **Preferences**        : `apps/web/app/api/notifications/preferences/route.ts` - Uses `NotificationService.getPreferences()` and `updatePreferences()`

## Route Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications?unreadOnly=true&limit=20&cursor=xyz` | Yes | List notifications with cursor pagination |
| POST | `/api/notifications/:id/read` | Yes | Mark single as read |
| POST | `/api/notifications/read-all` | Yes | Mark all as read |
| GET | `/api/notifications/preferences` | Yes | Get preferences |
| PUT | `/api/notifications/preferences` | Yes | Update preferences |

## Cross-References

- ApiRoute           : `apps/web/src/lib/api/ApiRoute.ts`
- NotificationService: `packages/services/src/integrations/NotificationService.ts`
- Types              : `packages/types/src/notifications.ts`
