import { integer, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { BaseFields } from './base'
import {
  governanceModelEnum,
  groupPrivacyLevelEnum,
  groupTypeEnum,
  removalPolicyEnum,
} from './enums'
import { members } from './members'

export const groups = pgTable('groups', {
  ...BaseFields,

  name             : varchar('name', { length: 255 }).notNull(),
  type             : groupTypeEnum('type').notNull(),
  description      : text('description'),
  createdByMemberId: uuid('created_by_member_id').notNull().references(() => members.id),
  privacyLevel     : groupPrivacyLevelEnum('privacy_level').notNull().default('PRIVATE'),
  governanceModel  : governanceModelEnum('governance_model').notNull(),
  removalPolicy    : removalPolicyEnum('removal_policy').notNull(),
  voteThreshold    : integer('vote_threshold'),
})

export type Group = typeof groups.$inferSelect
export type NewGroup = typeof groups.$inferInsert
