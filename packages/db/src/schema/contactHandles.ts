import { pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { privacyLevelEnum } from './enums'
import { persons } from './persons'

export const contactHandles = pgTable(
  'contact_handles',
  {
    ...BaseFields,

    personId   : uuid('person_id').notNull().references(() => persons.id),
    provider   : varchar('provider', { length: 64 }).notNull(),
    handle     : varchar('handle', { length: 255 }).notNull(),
    visibility : privacyLevelEnum('visibility').notNull().default('FAMILY'),
  },
  (t) => [
    uniqueIndex('contact_handles_person_provider_handle_unique').on(t.personId, t.provider, t.handle),
  ],
)

export type ContactHandle = typeof contactHandles.$inferSelect
export type NewContactHandle = typeof contactHandles.$inferInsert
