import { boolean, integer, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { BaseFields } from './base'
import { familyNameCategoryEnum } from './enums'
import { persons } from './persons'

export const personFamilyNames = pgTable(
  'person_family_names',
  {
    ...BaseFields,

    personId: uuid('person_id').notNull().references(() => persons.id),
    name    : varchar('name', { length: 255 }).notNull(),
    category: familyNameCategoryEnum('category').notNull(),
    active  : boolean('active').notNull().default(true),
    order   : integer('order').notNull(),
  },
  (t) => [
    uniqueIndex('person_family_names_person_order_unique').on(t.personId, t.order),
  ],
)

export type PersonFamilyName = typeof personFamilyNames.$inferSelect
export type NewPersonFamilyName = typeof personFamilyNames.$inferInsert
