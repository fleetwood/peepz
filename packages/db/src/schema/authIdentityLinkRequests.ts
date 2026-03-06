import { pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { members } from './members'

export const authIdentityLinkRequests = pgTable(
  'auth_identity_link_requests',
  {
    ...BaseFields,

    memberId       : uuid('member_id').notNull().references(() => members.id),

    provider       : varchar('provider', { length: 64 }).notNull(),
    providerUserId : varchar('provider_user_id', { length: 255 }).notNull(),
    providerEmail  : varchar('provider_email', { length: 255 }).notNull(),

    token          : varchar('token', { length: 255 }).notNull(),
    expiresAt      : timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
    consumedAt     : timestamp('consumed_at', { mode: 'date', withTimezone: true }),
  },
  (t) => [
    uniqueIndex('auth_identity_link_requests_token_unique').on(t.token),
  ],
)

export type AuthIdentityLinkRequest = typeof authIdentityLinkRequests.$inferSelect
export type NewAuthIdentityLinkRequest = typeof authIdentityLinkRequests.$inferInsert
