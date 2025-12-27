import { boolean, index, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

import { enumColumn } from '@peeps/utils'

import { BaseFields } from './base'
import { entityTypeEnum, privacyLevelEnum } from './enums'
import { members } from './members'

export const AddressType = {
  HOME : 'HOME',
  WORK : 'WORK',
  OTHER: 'OTHER',
} as const

export const addresses = pgTable(
  'addresses',
  {
    ...BaseFields,

    sourceType       : entityTypeEnum('source_type').notNull(),
    sourceId         : uuid('source_id').notNull(),

    label            : varchar('label', { length: 64 }),
    addressType      : enumColumn('address_type', AddressType).notNull().default('OTHER'),

    line1            : varchar('line_1', { length: 255 }).notNull(),
    line2            : varchar('line_2', { length: 255 }),
    locality         : varchar('locality', { length: 128 }),
    region           : varchar('region', { length: 128 }),
    postalCode       : varchar('postal_code', { length: 32 }),
    countryCode      : varchar('country_code', { length: 2 }).notNull(),

    createdByMemberId: uuid('created_by_member_id').references(() => members.id),

    isPrimary        : boolean('is_primary').notNull().default(false),
    isVerified       : boolean('is_verified').notNull().default(false),
    visibility       : privacyLevelEnum('visibility').notNull().default('FAMILY'),
  },
  (t) => [
    index('addresses_source_idx').on(t.sourceType, t.sourceId),
    uniqueIndex('addresses_source_dedupe_unique').on(
      t.sourceType,
      t.sourceId,
      t.addressType,
      t.line1,
      t.line2,
      t.locality,
      t.region,
      t.postalCode,
      t.countryCode,
    ),
  ],
)

export type Address = typeof addresses.$inferSelect
export type NewAddress = typeof addresses.$inferInsert
