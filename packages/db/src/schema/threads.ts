import { pgTable, text, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

import { enumColumn } from '@peeps/utils'

import { BaseFields } from './base'
import { entityTypeEnum } from './enums'
import { members } from './members'

export const ThreadType = {
  DIRECT  : 'DIRECT',
  ATTACHED: 'ATTACHED',
} as const

/**
 * A thread is either:
 * - DIRECT: a conversation between participants
 * - ATTACHED: the canonical discussion thread for a source entity
 */
export const threads = pgTable(
  'threads',
  {
    ...BaseFields,

    title            : varchar('title', { length: 255 }),
    description      : text('description'),
    type             : enumColumn('type', ThreadType).notNull(),

    sourceType       : entityTypeEnum('source_type'),
    sourceId         : uuid('source_id'),

    createdByMemberId: uuid('created_by_member_id').notNull().references(() => members.id),
  },
  (t) => [
    uniqueIndex('threads_source_unique').on(t.sourceType, t.sourceId),
  ],
)

export type Thread = typeof threads.$inferSelect
export type NewThread = typeof threads.$inferInsert
