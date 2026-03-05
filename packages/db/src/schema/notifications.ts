import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { notificationTypeEnum } from './enums'
import { members } from './members'
import { groups } from './groups'

export const notifications = pgTable('notifications', {
  ...BaseFields,

  memberId: uuid('member_id').notNull().references(() => members.id),
  groupId : uuid('group_id').references(() => groups.id),

  type   : notificationTypeEnum('type'),
  title  : varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  link   : varchar('link', { length: 512 }),

  read   : boolean('read').notNull().default(false),
  readAt : timestamp('read_at', { mode: 'date', withTimezone: true }),

  relatedRequestId: uuid('related_request_id'),
  relatedMemberId : uuid('related_member_id'),
})

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
