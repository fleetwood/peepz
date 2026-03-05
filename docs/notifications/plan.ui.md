# Notifications: UI Layer

## Goal

Build notification UI components: bell with unread badge, dropdown menu, full-page inbox, and toast notifications for real-time updates.

## Dependencies

- `@peeps/client/notifications` - `useNotifications`, `useUnreadCount`, `useMarkAsRead`, `useRealtimeNotifications`
- `@peeps/client/socket` - `SocketClient` for real-time updates
- `lucide-react` - Icons (Bell, Check, Settings, etc.)
- `sonner` or `@radix-ui/react-toast` - Toast notifications
- TailwindCSS - Styling

## Files to Create

- `apps/web/src/components/notifications/NotificationBell.tsx` - Header bell icon with badge
- `apps/web/src/components/notifications/NotificationDropdown.tsx` - Dropdown with recent notifications
- `apps/web/src/components/notifications/NotificationInbox.tsx` - Full page notification center
- `apps/web/src/components/notifications/NotificationToast.tsx` - Toast for real-time notifications
- `apps/web/src/components/notifications/NotificationPreferences.tsx` - Settings form

## Components

### NotificationBell

```typescript
// apps/web/src/components/notifications/NotificationBell.tsx
'use client'

import { Bell } from 'lucide-react'
import { useUnreadCount } from '@peeps/client'

export function NotificationBell() {
  const { data: unreadCount = 0, isLoading } = useUnreadCount()
  
  return (
    <button className="relative p-2 hover:bg-gray-100 rounded-full">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
```

### NotificationDropdown

```typescript
// apps/web/src/components/notifications/NotificationDropdown.tsx
'use client'

import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@peeps/client'
import { formatDistanceToNow } from 'date-fns'

export function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { data: notifications = [], isLoading } = useNotifications({ limit: 10 })
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  
  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id)
  }
  
  return (
    <div className="w-80 bg-white shadow-lg rounded-lg border">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <button
          onClick={() => markAllAsRead.mutate()}
          className="text-sm text-blue-600 hover:underline"
        >
          Mark all read
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No notifications</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                !notif.read ? 'bg-blue-50' : ''
              }`}
              onClick={() => !notif.read && handleMarkAsRead(notif.id)}
            >
              <p className="font-medium text-sm">{notif.title}</p>
              <p className="text-sm text-gray-600">{notif.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 border-t text-center">
        <a href="/notifications" className="text-sm text-blue-600 hover:underline">
          View all
        </a>
      </div>
    </div>
  )
}
```

### NotificationInbox

```typescript
// apps/web/src/components/notifications/NotificationInbox.tsx
'use client'

import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@peeps/client'
import { format } from 'date-fns'

export function NotificationInbox() {
  const { data: notifications = [], isLoading } = useNotifications({ limit: 50 })
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={() => markAllAsRead.mutate()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-lg border ${
              !notif.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
            }`}
            onClick={() => !notif.read && markAsRead.mutate(notif.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{notif.title}</h3>
                <p className="text-gray-600">{notif.message}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {format(new Date(notif.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              {!notif.read && (
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### NotificationToast

```typescript
// apps/web/src/components/notifications/NotificationToast.tsx
'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRealtimeNotifications } from '@peeps/client'

export function NotificationToast() {
  useRealtimeNotifications((notification) => {
    toast(notification.title, {
      description: notification.message,
      action: notification.link
        ? {
            label: 'View',
            onClick: () => window.location.href = notification.link!,
          }
        : undefined,
    })
  })
  
  return null // This is a behavior-only component
}
```

### NotificationPreferences

```typescript
// apps/web/src/components/notifications/NotificationPreferences.tsx
'use client'

import { useNotificationPreferences, useUpdateNotificationPreferences } from '@peeps/client'

export function NotificationPreferences() {
  const { data: preferences, isLoading } = useNotificationPreferences()
  const updatePreferences = useUpdateNotificationPreferences()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label>Email Notifications</label>
          <input
            type="checkbox"
            checked={preferences?.email}
            onChange={(e) => updatePreferences.mutate({ email: e.target.checked })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label>Push Notifications</label>
          <input
            type="checkbox"
            checked={preferences?.pushNotifications}
            onChange={(e) => updatePreferences.mutate({ pushNotifications: e.target.checked })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label>Real-time Notifications</label>
          <input
            type="checkbox"
            checked={preferences?.realtime}
            onChange={(e) => updatePreferences.mutate({ realtime: e.target.checked })}
          />
        </div>
        
        <div>
          <label className="block mb-2">Digest Frequency</label>
          <select
            value={preferences?.digest}
            onChange={(e) => updatePreferences.mutate({ digest: e.target.value as any })}
            className="w-full border rounded p-2"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="NEVER">Never</option>
          </select>
        </div>
      </div>
    </div>
  )
}
```

## Page Routes

```typescript
// apps/web/app/notifications/page.tsx
import { NotificationInbox } from '@/components/notifications/NotificationInbox'

export default function NotificationsPage() {
  return <NotificationInbox />
}

// apps/web/app/notifications/preferences/page.tsx
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences'

export default function NotificationPreferencesPage() {
  return <NotificationPreferences />
}
```

## Header Integration

```typescript
// apps/web/src/components/layout/Header.tsx (update)
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { NotificationToast } from '@/components/notifications/NotificationToast'

export function Header() {
  return (
    <header>
      {/* ... other header content */}
      <NotificationBell />
      {/* ... dropdown portal or popover */}
      <NotificationToast />
    </header>
  )
}
```

## Cross-References

- Client hooks: `packages/client/src/notifications/notifications.client.ts`
- SocketClient: `packages/client/src/socket/SocketClient.ts`
- Types: `packages/types/src/notifications.ts`

## Notes

- NotificationToast is mounted once in layout (behavior-only)
- NotificationBell shows unread count badge
- Dropdown shows recent 10 notifications
- Inbox page shows all notifications with pagination
- Real-time updates trigger toast + badge increment
