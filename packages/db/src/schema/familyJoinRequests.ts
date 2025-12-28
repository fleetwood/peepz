import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

import { BaseFields } from './base'
import { requestStatusEnum } from './enums'
import { groups } from './groups'
import { members } from './members'

export const familyJoinRequests = pgTable('family_join_requests', {
  ...BaseFields,

  memberId: uuid('member_id').notNull().references(() => members.id),
  groupId : uuid('group_id').notNull().references(() => groups.id),

  claimedRelationships: jsonb('claimed_relationships').notNull().default(sql`'[]'::jsonb`),
  confirmations       : jsonb('confirmations').notNull().default(sql`'[]'::jsonb`),

  status   : requestStatusEnum('status').notNull().default('PENDING'),
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
})

export type FamilyJoinRequest = typeof familyJoinRequests.$inferSelect
export type NewFamilyJoinRequest = typeof familyJoinRequests.$inferInsert
