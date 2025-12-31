import { date, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { BaseFields } from './base'

export const persons = pgTable('persons', {
  ...BaseFields,

  name         : text('name').array().notNull(),
  firstName    : varchar('first_name', { length: 255 }),
  lastName     : varchar('last_name', { length: 255 }),
  dateOfBirth  : date('date_of_birth'),
  preferredName: varchar('preferred_name', { length: 255 }),
  avatarUrl    : varchar('avatar_url', { length: 2048 }),

  createdByMemberId: uuid('created_by_member_id'),
})

export type Person = typeof persons.$inferSelect
export type NewPerson = typeof persons.$inferInsert
