import { index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { BaseFields } from './base'
import { eventInstances } from './eventInstances'
import { members } from './members'
import { rsvpStatusEnum } from './enums'

export const eventAttendees = pgTable(
  'event_attendees',
  {
    ...BaseFields,

    eventInstanceId: uuid('event_instance_id').notNull().references(() => eventInstances.id),
    memberId       : uuid('member_id').notNull().references(() => members.id),

    status         : rsvpStatusEnum('status').notNull().default('PENDING'),
    respondedAt    : timestamp('responded_at', { mode: 'date', withTimezone: true }),
  },
  (t) => [
    index('event_attendees_instance_idx').on(t.eventInstanceId),
    uniqueIndex('event_attendees_instance_member_unique').on(t.eventInstanceId, t.memberId),
  ],
)

export type EventAttendee = typeof eventAttendees.$inferSelect
export type NewEventAttendee = typeof eventAttendees.$inferInsert
