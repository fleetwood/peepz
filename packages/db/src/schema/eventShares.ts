import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { eventShareTargetEnum } from './enums'
import { eventSeries } from './eventSeries'

export const eventShares = pgTable(
  'event_shares',
  {
    ...BaseFields,

    eventSeriesId: uuid('event_series_id').notNull().references(() => eventSeries.id),
    targetType   : eventShareTargetEnum('target_type').notNull(),
    targetId     : uuid('target_id').notNull(),
  },
  (t) => [
    index('event_shares_series_idx').on(t.eventSeriesId),
    uniqueIndex('event_shares_series_target_unique').on(t.eventSeriesId, t.targetType, t.targetId),
  ],
)

export type EventShare = typeof eventShares.$inferSelect
export type NewEventShare = typeof eventShares.$inferInsert
