import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { invitationStatusEnum, relationshipTypeEnum } from './enums'
import { groups } from './groups'
import { members } from './members'

export const invitations = pgTable('invitations', {
  ...BaseFields,

  invitedByMemberId: uuid('invited_by_member_id').notNull().references(() => members.id),
  groupId          : uuid('group_id').notNull().references(() => groups.id),

  email       : varchar('email', { length: 255 }).notNull(),
  firstName   : varchar('first_name', { length: 255 }),
  lastName    : varchar('last_name', { length: 255 }),
  relationship: relationshipTypeEnum('relationship'),

  status   : invitationStatusEnum('status').notNull().default('PENDING'),
  token    : varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
})

export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
