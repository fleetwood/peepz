import { boolean, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { notificationDigestEnum } from './enums'
import { members } from './members'

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    ...BaseFields,

    memberId: uuid('member_id').notNull().references(() => members.id),

    pushNotifications: boolean('push_notifications').notNull().default(true),
    email            : boolean('email').notNull().default(true),
    sms              : boolean('sms').notNull().default(false),
    realtime         : boolean('realtime').notNull().default(true),

    digest        : notificationDigestEnum('digest').notNull().default('DAILY'),
    mentions      : boolean('mentions').notNull().default(true),
    directMessages: boolean('direct_messages').notNull().default(true),
    allMessages   : boolean('all_messages').notNull().default(true),

    quietHoursEnabled : boolean('quiet_hours_enabled').notNull().default(false),
    quietHoursStart   : varchar('quiet_hours_start', { length: 10 }),
    quietHoursEnd     : varchar('quiet_hours_end', { length: 10 }),
    quietHoursTimezone: varchar('quiet_hours_timezone', { length: 64 }),
  },
  (t) => [
    uniqueIndex('notification_preferences_member_id_unique').on(t.memberId),
  ],
)

export type NotificationPreferences = typeof notificationPreferences.$inferSelect
export type NewNotificationPreferences = typeof notificationPreferences.$inferInsert
