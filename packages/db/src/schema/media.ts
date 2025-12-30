import { bigint, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { mediaTypeEnum } from './enums'
import { albums } from './albums'
import { members } from './members'

export const media = pgTable(
  'media',
  {
    ...BaseFields,

    albumId            : uuid('album_id').notNull().references(() => albums.id),
    uploadedByMemberId : uuid('uploaded_by_member_id').notNull().references(() => members.id),

    mediaType          : mediaTypeEnum('media_type').notNull(),

    fileUrl            : text('file_url').notNull(),
    thumbnailUrl       : text('thumbnail_url'),
    caption            : text('caption'),

    takenAt            : timestamp('taken_at', { mode: 'date', withTimezone: true }),
    uploadedAt         : timestamp('uploaded_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    deletedAt          : timestamp('deleted_at', { mode: 'date', withTimezone: true }),

    durationSeconds    : integer('duration_seconds'),
    width              : integer('width'),
    height             : integer('height'),
    fileSizeBytes      : bigint('file_size_bytes', { mode: 'number' }).notNull(),
  },
)

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
