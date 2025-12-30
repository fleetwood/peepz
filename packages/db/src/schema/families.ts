import { pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { BaseFields } from './base'
import { groups } from './groups'

export const families = pgTable(
  'families',
  {
    ...BaseFields,
    groupId: uuid('group_id').notNull().references(() => groups.id),
  },
  (t) => [
    uniqueIndex('families_group_id_unique').on(t.groupId),
  ],
)

export type Family = typeof families.$inferSelect
export type NewFamily = typeof families.$inferInsert
