import { boolean, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

import { enumColumn } from '@peeps/utils'

import { BaseFields } from './base'
import { privacyLevelEnum } from './enums'
import { persons } from './persons'

export const ContactPointType = {
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
} as const

export const contactPoints = pgTable(
  'contact_points',
  {
    ...BaseFields,

    personId   : uuid('person_id').notNull().references(() => persons.id),
    type       : enumColumn('type', ContactPointType).notNull(),
    value      : varchar('value', { length: 255 }).notNull(),
    isPrimary  : boolean('is_primary').notNull().default(false),
    isVerified : boolean('is_verified').notNull().default(false),
    visibility : privacyLevelEnum('visibility').notNull().default('FAMILY'),
  },
  (t) => [
    uniqueIndex('contact_points_person_type_value_unique').on(t.personId, t.type, t.value),
  ],
)

export type ContactPoint = typeof contactPoints.$inferSelect
export type NewContactPoint = typeof contactPoints.$inferInsert
