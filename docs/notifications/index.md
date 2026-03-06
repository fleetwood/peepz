# Notifications Implementation Plan

## Overview

Build a comprehensive notification system for the peeps codebase that supports:
- **In-app notifications** (persisted, unread/read states)
- **Email notifications** (via Resend)
- **Push notifications** (future: Firebase FCM)
- **Real-time delivery** (via SocketClient)
- **Digest emails** (batched notifications)

## Architecture

### Layered Approach (consistent with onboarding flow)

1. **Types** - Shared notification types and schemas
2. **Database** - Notifications schema (✅ exists)
3. **Services** - NotificationService + Resend integration (✅ partially exists)
4. **API** - Endpoints for marking read, fetching
5. **Client** - React hooks for notification state
6. **UI** - Toast, notification bell, inbox

## Core Principles

- **Single source of truth**: `notifications` table
- **Preference-driven**: Respect user notification_preferences
- **Channel agnostic**: Same notification can go to multiple channels
- **Groupable**: Unread notifications group by (type, sourceId) to avoid spam
- **Real-time**: Socket delivery for active users
- **Offline support**: Persist for offline users, deliver on reconnect

## Types Layer

### Files
- `packages/types/src/notifications.ts` - Core notification types
- `packages/types/src/index.ts` - Export

### Types Needed
- `NotificationType` - JOIN_REQUEST, APPROVAL, COMMENT, MENTION, etc.
- `NotificationChannel` - IN_APP, EMAIL, PUSH, REALTIME
- `CreateNotificationInput` - Base payload
- `NotificationPreferences` - From existing schema

### Zod Schemas
- `CreateNotificationInputSchema`
- `NotificationPreferencesSchema`

## Database Layer

### Existing (✅)
- `packages/db/src/schema/notifications.ts` - notifications table
- `packages/db/src/schema/notificationPreferences.ts` - preferences table

### Needed
- Index on `memberId + read` for unread count queries
- Index on `createdAt` for digest queries

## Services Layer

### Files
- `packages/services/src/integrations/NotificationService.ts` - Main orchestrator
- `packages/services/src/integrations/ResendService.ts` - ✅ exists
- `packages/services/src/index.ts` - Export

### NotificationService API

```typescript
export class NotificationService {
  // Core
  static async create(input: CreateNotificationInput): Promise<Notification>
  static async markAsRead(memberId: string, ids?: string[]): Promise<void>
  static async markAllAsRead(memberId: string): Promise<void>
  
  // Queries
  static async getUnread(memberId: string): Promise<Notification[]>
  static async getRecent(memberId: string, limit?: number): Promise<Notification[]>
  static async getDigest(memberId: string, date?: Date): Promise<Notification[]>
  
  // Real-time
  static async broadcast(notif: Notification): Promise<void>
}
```

### NotificationService Responsibilities

1. **Persist** - Insert into notifications table
2. **Filter** - Check preferences (email/push/realtime)
3. **Group** - Group unread by (type, sourceId)
4. **Deliver** - Send via appropriate channels
   - In-app: Persist only
   - Email: ResendService
   - Real-time: SocketClient

### Notification Factories

```typescript
// packages/services/src/notifications/factories.ts
export const NotificationFactories = {
  joinRequest: (params: JoinRequestNotifParams) => CreateNotificationInput
  approval: (params: ApprovalNotifParams) => CreateNotificationInput
  mention: (params: MentionNotifParams) => CreateNotificationInput
  comment: (params: CommentNotifParams) => CreateNotificationInput
}
```

## API Layer

### Files
- `apps/web/app/api/notifications/route.ts` - List notifications
- `apps/web/app/api/notifications/[id]/read/route.ts` - Mark single read
- `apps/web/app/api/notifications/read-all/route.ts` - Mark all read
- `apps/web/app/api/notifications/preferences/route.ts` - Get/update preferences

### Endpoints

```
GET    /api/notifications?unreadOnly=true&limit=20
POST   /api/notifications/:id/read
POST   /api/notifications/read-all
GET    /api/notifications/preferences
PUT    /api/notifications/preferences
```

## Client Layer

### Files
- `packages/client/src/notifications/notifications.client.ts`
- `packages/client/src/index.ts` - Export

### Hooks

```typescript
export class NotificationClient {
  useNotifications(options?: { unreadOnly?: boolean })
  useUnreadCount()
  useMarkAsRead()
  useMarkAllAsRead()
  useNotificationPreferences()
}
```

## UI Layer

### Components
- `NotificationBell` - Header icon with badge
- `NotificationDropdown` - Recent notifications list
- `NotificationInbox` - Full page notification center
- `NotificationToast` - Real-time toast for new notifs

### Socket Integration
- Listen on `POST/notifications/{memberId}`
- Show toast on new notification
- Increment unread badge

## Implementation Order

1. **Types** - Create shared types
2. **Service Core** - NotificationService with create/get/markRead
3. **Factories** - Join request, approval, mention, comment
4. **API** - REST endpoints
5. **Client** - React hooks
6. **UI** - Bell, dropdown, inbox
7. **Socket** - Real-time delivery
8. **Email** - Digest service (Cron)

## Integration Points

### FamilyJoinRequestService
- Replace direct `notifications` INSERT with `NotificationService.create()`
- Use `NotificationFactories.joinRequest()` for payload

### Other Services
- PostService → mentions
- CommentService → comments
- Future: LikeService, FollowService, etc.

## Configuration

### Environment Variables (existing)
- `RESEND_API_KEY` - ✅
- `RESEND_FROM_EMAIL` - ✅

### New
- `FIREBASE_PROJECT_ID` - Future push
- `FIREBASE_PRIVATE_KEY` - Future push

## Testing Strategy

1. Unit: NotificationService methods
2. Integration: NotificationService + ResendService
3. E2E: Create join request → notification created → mark as read

## Migration

No migration needed - notifications table exists, data is additive.

## Open Questions

1. Push notifications - Firebase setup needed?
2. Email templates - MJML or simple HTML?
3. Digest frequency - Daily default? User configurable?
4. Quiet hours - Implement in NotificationService or ResendService?

---

**Status**: Ready to implement
**Priority**: High (blocks FamilyJoinRequestService cleanup)