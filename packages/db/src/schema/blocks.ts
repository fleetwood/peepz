import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { blockTypeEnum, entityTypeEnum } from './enums'
import { members } from './members'

export const blocks = pgTable(
  'blocks',
  {
    ...BaseFields,

    memberId      : uuid('member_id').notNull().references(() => members.id),
    resourceType  : entityTypeEnum('resource_type').notNull(),
    resourceId    : uuid('resource_id').notNull(),
    blockType     : blockTypeEnum('block_type').notNull(),
    untilDate     : timestamp('until_date', { mode: 'date', withTimezone: true }),
    reason        : text('reason'),
  },
  (t) => [
    uniqueIndex('blocks_member_resource_type_id_unique').on(t.memberId, t.resourceType, t.resourceId, t.blockType),
  ],
)

export type Block = typeof blocks.$inferSelect
export type NewBlock = typeof blocks.$inferInsert
