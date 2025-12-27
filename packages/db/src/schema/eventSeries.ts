import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

import { enumColumn } from '@peeps/utils'

import { BaseFields } from './base'
import { entityTypeEnum, eventRoleEnum, privacyLevelEnum } from './enums'
import { addresses } from './addresses'
import { members } from './members'

export const eventSeries = pgTable(
  'event_series',
  {
    ...BaseFields,

    title            : varchar('title', { length: 255 }).notNull(),
    description      : text('description'),

    recurrenceRule    : text('recurrence_rule'), // RRULE (RFC 5545), null = one-time

    defaultLocationId: uuid('default_location_id').references(() => addresses.id),
    defaultRsvpClosesAt: timestamp('default_rsvp_closes_at', { mode: 'date', withTimezone: true }),

    createdByMemberId : uuid('created_by_member_id').notNull().references(() => members.id),
    visibility        : privacyLevelEnum('visibility').notNull().default('FAMILY'),
  },
  (t) => [
    index('event_series_created_by_idx').on(t.createdByMemberId),
  ],
)

export const eventSeriesOwners = pgTable(
  'event_series_owners',
  {
    ...BaseFields,

    eventSeriesId: uuid('event_series_id').notNull().references(() => eventSeries.id),
    memberId     : uuid('member_id').notNull().references(() => members.id),
    role         : eventRoleEnum('role').notNull().default('VIEWER'),
  },
  (t) => [
    uniqueIndex('event_series_owners_series_member_unique').on(t.eventSeriesId, t.memberId),
  ],
)

export type EventSeries = typeof eventSeries.$inferSelect
export type NewEventSeries = typeof eventSeries.$inferInsert

export type EventSeriesOwner = typeof eventSeriesOwners.$inferSelect
export type NewEventSeriesOwner = typeof eventSeriesOwners.$inferInsert
