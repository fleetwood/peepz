# Notifications: Service Layer

## Goal

Build `NotificationService` to orchestrate notification creation, delivery, and management. Delegates to `ResendService` for email and `SocketClient` for real-time. Integrates with `notification_preferences` for user settings.

## Dependencies

- `@peeps/types` - `CreateNotificationInput`, `Notification`, `NotificationType`
- `@peeps/db` - `notifications` table, `notificationPreferences` table, `NotificationType` enum
- `@peeps/services/ResendService` - Email delivery
- `@peeps/client/SocketClient` - Real-time delivery (future)

## Files Created

- `packages/services/src/integrations/NotificationService.ts` - Main service
- `packages/services/src/integrations/NotificationFactories.ts` - Factory functions (separate file)
- `packages/services/src/index.ts` - Export (updated)

## Implementation

See `packages/services/src/integrations/NotificationService.ts` for:

### NotificationService Methods
- `create(input)` - Creates and delivers notification (checks prefs via MemberService, persists, sends email)
- `markAsRead(memberId, ids?)` - Marks notifications as read
- `markAllAsRead(memberId)` - Marks all as read
- `getUnread(memberId, limit?)` - Gets unread notifications
- `getForMember(memberId, options?)` - Gets notifications for member with cursor pagination (`limit`, `cursor`, `onlyUnread`). Filters to visible notifications only
- `getDigest(memberId, date?)` - Gets notifications for digest email
- `hide(memberId, ids)` - Hides notifications (sets visible=false)
- `delete(memberId, ids?)` - Deletes notifications

See `packages/services/src/integrations/NotificationFactories.ts` for:

### NotificationFactories
- `joinRequest(params)` - Creates join request notification input
- `joinRequestApproval(params)` - Creates join request approval notification input
- `relationship(params)` - Creates relationship claim notification input

## Integration with FamilyJoinRequestService

Replace direct INSERT with NotificationService call:

```typescript
// packages/services/src/entities/FamilyJoinRequestService.ts

// BEFORE (violation):
await params.tx!.insert(schema.notifications).values({...})

// AFTER (clean):
for (const admin of adminMemberships) {
  if (requestingMember) {
    const notifInput = NotificationFactories.joinRequest({
      memberId         : admin.membership.personId,
      requesterMemberId: memberId,
      requesterName    : `${requestingMember.person.firstName} ${requestingMember.person.lastName}`,
      familyId         : familyId,
      familyName       : '...', // Need to fetch family name
      requestId        : joinRequest.id,
    })
    
    await NotificationService.create(notifInput)
  }
}
```

## Cross-References

- Types                   : `packages/types/src/notifications.ts` - `CreateNotificationInput`
- ResendService           : `packages/services/src/integrations/ResendService.ts`
- FamilyJoinRequestService: `packages/services/src/entities/FamilyJoinRequestService.ts`

## Notes

- NotificationService does NOT check blocks - that's the caller's responsibility
- Email sending is async and non-blocking (fire-and-forget)
- Real-time delivery only happens if user is connected via socket
- Digest generation is a separate cron job, not part of create()
