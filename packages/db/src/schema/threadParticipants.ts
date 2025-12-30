import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { enumColumn } from '@peeps/utils'

import { BaseFields } from './base'
import { members } from './members'
import { threads } from './threads'

export const ThreadParticipantRole = {
  MEMBER: 'MEMBER',
  ADMIN : 'ADMIN',
} as const

export const threadParticipants = pgTable(
  'thread_participants',
  {
    ...BaseFields,

    threadId   : uuid('thread_id').notNull().references(() => threads.id),
    memberId   : uuid('member_id').notNull().references(() => members.id),
    role       : enumColumn('role', ThreadParticipantRole).notNull().default('MEMBER'),
    lastReadAt : timestamp('last_read_at', { mode: 'date', withTimezone: true }),
    mutedUntil : timestamp('muted_until', { mode: 'date', withTimezone: true }),
  },
  (t) => [
    uniqueIndex('thread_participants_thread_member_unique').on(t.threadId, t.memberId),
  ],
)

export type ThreadParticipant = typeof threadParticipants.$inferSelect
export type NewThreadParticipant = typeof threadParticipants.$inferInsert
