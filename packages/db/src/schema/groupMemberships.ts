import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { BaseFields } from './base'
import { groupRoleEnum, membershipStatusEnum } from './enums'
import { groups } from './groups'
import { members } from './members'
import { persons } from './persons'

export const groupMemberships = pgTable('group_memberships', {
  ...BaseFields,

  groupId          : uuid('group_id').notNull().references(() => groups.id),
  personId         : uuid('person_id').notNull().references(() => persons.id),
  role             : groupRoleEnum('role').notNull().default('MEMBER'),
  status           : membershipStatusEnum('status').notNull().default('ACTIVE'),
  invitedByMemberId: uuid('invited_by_member_id').references(() => members.id),
  joinedAt         : timestamp('joined_at').defaultNow().notNull(),
})

export type GroupMembership = typeof groupMemberships.$inferSelect
export type NewGroupMembership = typeof groupMemberships.$inferInsert
