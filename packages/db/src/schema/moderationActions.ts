import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { entityTypeEnum, moderationActionEnum } from './enums'
import { members } from './members'

export const moderationActions = pgTable('moderation_actions', {
  ...BaseFields,

  performedByMemberId: uuid('performed_by_member_id').notNull().references(() => members.id),

  targetType: entityTypeEnum('target_type').notNull(),
  targetId  : uuid('target_id').notNull(),

  action: moderationActionEnum('action').notNull(),
  reason: text('reason').notNull().default(''),
})

export type ModerationActionRow = typeof moderationActions.$inferSelect
export type NewModerationActionRow = typeof moderationActions.$inferInsert
