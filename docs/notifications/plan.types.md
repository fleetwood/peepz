# Notifications: Types Layer

## Goal

Define shared, Zod-backed types for notification payloads, API contracts, and UI state to ensure type safety across all layers. No dependencies on downstream layers.

## Dependencies

- None. This layer is implemented first and exported for all downstream layers.
- Uses `@peeps/db` for enum references (via `z.nativeEnum`).

## Files Created

- `packages/types/src/notifications.ts` - Core notification types
- `packages/types/src/index.ts` - Export (updated)

## Implementation

See `packages/types/src/notifications.ts` for:

- `NotificationChannelSchema` - Uses `z.nativeEnum(NotificationChannel)` from DB
- `NotificationTypeSchema` - Uses `z.nativeEnum(NotificationType)` from DB  
- `CreateNotificationInputSchema` - Notification creation payload
- `NotificationPreferencesSchema` - User preference settings
- Factory param types: `JoinRequestNotificationParams`, `ApprovalNotificationParams`, `RelationshipNotificationParams`
- API schemas: `ListNotificationsQuerySchema`, `MarkAsReadInputSchema`

## Cross-References

- DB enums: `packages/db/src/schema/enums.ts` - `NotificationType`, `NotificationChannel`, `NotificationDigest`
- DB schema: `packages/db/src/schema/notifications.ts` - `Notification` table type
- DB schema: `packages/db/src/schema/notificationPreferences.ts` - `NotificationPreferences` table type

## Notes

- All Zod schemas use `.nativeEnum()` for DB enum references (no hardcoded values)
- `CreateNotificationInput` is what services use; `Notification` is what DB returns
- Factory types are plain TypeScript (no Zod) since they're internal service helpers
