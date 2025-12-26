import { date, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { BaseFields } from './base'

export const persons = pgTable('persons', {
  ...BaseFields,

  name: text('name').array().notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  preferredName: varchar('preferred_name', { length: 255 }),

  createdByMemberId: uuid('created_by_member_id'),
})

export type Person = typeof persons.$inferSelect
export type NewPerson = typeof persons.$inferInsert
