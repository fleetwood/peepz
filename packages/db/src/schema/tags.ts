import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { entityTypeEnum, tagStatusEnum } from './enums'
import { members } from './members'
import { persons } from './persons'

export const tags = pgTable(
  'tags',
  {
    ...BaseFields,

    sourceType       : entityTypeEnum('source_type').notNull(),
    sourceId         : uuid('source_id').notNull(),

    personId         : uuid('person_id').notNull().references(() => persons.id),
    taggedByMemberId : uuid('tagged_by_member_id').notNull().references(() => members.id),

    status           : tagStatusEnum('status').notNull().default('PENDING'),
  },
  (t) => [
    index('tags_source_idx').on(t.sourceType, t.sourceId),
    uniqueIndex('tags_source_person_unique').on(t.sourceType, t.sourceId, t.personId),
  ],
)

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
