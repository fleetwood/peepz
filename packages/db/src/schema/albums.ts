import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { privacyLevelEnum } from './enums'
import { groups } from './groups'
import { members } from './members'

export const albums = pgTable(
  'albums',
  {
    ...BaseFields,

    title            : varchar('title', { length: 255 }).notNull(),
    description      : text('description'),

    groupId           : uuid('group_id').references(() => groups.id),
    eventId           : uuid('event_id'),

    createdByMemberId : uuid('created_by_member_id').notNull().references(() => members.id),
    privacyLevel      : privacyLevelEnum('privacy_level').notNull().default('FAMILY'),
  },
)

export type Album = typeof albums.$inferSelect
export type NewAlbum = typeof albums.$inferInsert
