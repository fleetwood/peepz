import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { eventInstanceStatusEnum } from './enums'
import { addresses } from './addresses'
import { eventSeries } from './eventSeries'

export const eventInstances = pgTable(
  'event_instances',
  {
    ...BaseFields,

    eventSeriesId: uuid('event_series_id').notNull().references(() => eventSeries.id),

    startsAt     : timestamp('starts_at', { mode: 'date', withTimezone: true }).notNull(),
    endsAt       : timestamp('ends_at', { mode: 'date', withTimezone: true }).notNull(),

    locationId   : uuid('location_id').references(() => addresses.id),
    rsvpClosesAt : timestamp('rsvp_closes_at', { mode: 'date', withTimezone: true }),

    status       : eventInstanceStatusEnum('status').notNull().default('ACTIVE'),
  },
  (t) => [
    index('event_instances_series_idx').on(t.eventSeriesId),
    index('event_instances_starts_at_idx').on(t.startsAt),
  ],
)

export type EventInstance = typeof eventInstances.$inferSelect
export type NewEventInstance = typeof eventInstances.$inferInsert
