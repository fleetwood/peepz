import { jsonb, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

import { BaseFields } from './base'
import { members } from './members'

export const authIdentities = pgTable(
  'auth_identities',
  {
    ...BaseFields,

    memberId       : uuid('member_id').notNull().references(() => members.id),
    provider       : varchar('provider', { length: 64 }).notNull(),
    providerUserId : varchar('provider_user_id', { length: 255 }).notNull(),

    email          : varchar('email', { length: 255 }),
    rawProfile     : jsonb('raw_profile').notNull().default(sql`'{}'::jsonb`),
    lastSeenAt     : timestamp('last_seen_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('auth_identities_provider_provider_user_id_unique').on(t.provider, t.providerUserId),
    uniqueIndex('auth_identities_member_provider_unique').on(t.memberId, t.provider),
  ],
)

export type AuthIdentity = typeof authIdentities.$inferSelect
export type NewAuthIdentity = typeof authIdentities.$inferInsert
