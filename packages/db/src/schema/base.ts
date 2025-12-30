import { boolean, timestamp, uuid } from 'drizzle-orm/pg-core'

export const BaseFields = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  visible  : boolean('visible').default(true).notNull()
}