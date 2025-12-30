import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { entityTypeEnum, reportReasonEnum, reportStatusEnum } from './enums'
import { members } from './members'

export const contentReports = pgTable(
  'content_reports',
  {
    ...BaseFields,

    reportedByMemberId : uuid('reported_by_member_id').notNull().references(() => members.id),

    contentType        : entityTypeEnum('content_type').notNull(),
    contentId          : uuid('content_id').notNull(),

    reason             : reportReasonEnum('reason').notNull(),
    description        : text('description'),

    status             : reportStatusEnum('status').notNull().default('PENDING'),

    reviewedByMemberId : uuid('reviewed_by_member_id').references(() => members.id),
    reviewedAt         : timestamp('reviewed_at', { mode: 'date', withTimezone: true }),
  },
  (t) => [
    index('content_reports_content_idx').on(t.contentType, t.contentId),
  ],
)

export type ContentReport = typeof contentReports.$inferSelect
export type NewContentReport = typeof contentReports.$inferInsert
