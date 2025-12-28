import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { BaseFields } from './base'
import { privacyLevelEnum } from './enums'
import { persons } from './persons'

export const members = pgTable('members', {
  ...BaseFields,

  personId    : uuid('person_id').notNull().references(() => persons.id),
  authUserId  : uuid('auth_user_id').notNull().unique(),
  email       : varchar('email', { length: 255 }).notNull().unique(),
  privacyLevel: privacyLevelEnum('privacy_level').notNull().default('FAMILY'),
})

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
