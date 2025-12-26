import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

import { BaseFields } from './base'
import { entityTypeEnum, removalRequestTypeEnum, requestStatusEnum } from './enums'
import { members } from './members'

export const removalRequests = pgTable(
  'removal_requests',
  {
    ...BaseFields,

    resourceType         : entityTypeEnum('resource_type').notNull(),
    resourceId           : uuid('resource_id').notNull(),

    requestedByMemberId  : uuid('requested_by_member_id').notNull().references(() => members.id),
    requestType          : removalRequestTypeEnum('request_type').notNull(),
    reason               : text('reason'),

    status               : requestStatusEnum('status').notNull().default('PENDING'),
    votes                : jsonb('votes').notNull().default(sql`'[]'::jsonb`),

    reviewedByMemberId   : uuid('reviewed_by_member_id').references(() => members.id),
    reviewedAt           : timestamp('reviewed_at', { mode: 'date', withTimezone: true }),
    gracePeriodEnds      : timestamp('grace_period_ends', { mode: 'date', withTimezone: true }),
  },
  (t) => [
    index('removal_requests_resource_idx').on(t.resourceType, t.resourceId),
  ],
)

export type RemovalRequest = typeof removalRequests.$inferSelect
export type NewRemovalRequest = typeof removalRequests.$inferInsert
