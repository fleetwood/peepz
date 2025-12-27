import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { enumColumn } from '@peeps/utils'

import { BaseFields } from './base'
import { eventInstances } from './eventInstances'
import { persons } from './persons'

export const EventParticipantRole = {
  PRIMARY   : 'PRIMARY',
  CO_HOST   : 'CO_HOST',
  PARTICIPANT: 'PARTICIPANT',
} as const

export const eventParticipants = pgTable(
  'event_participants',
  {
    ...BaseFields,

    eventInstanceId: uuid('event_instance_id').notNull().references(() => eventInstances.id),
    personId       : uuid('person_id').notNull().references(() => persons.id),
    role           : enumColumn('role', EventParticipantRole).notNull().default('PARTICIPANT'),
  },
  (t) => [
    index('event_participants_instance_idx').on(t.eventInstanceId),
    uniqueIndex('event_participants_instance_person_unique').on(t.eventInstanceId, t.personId),
  ],
)

export type EventParticipant = typeof eventParticipants.$inferSelect
export type NewEventParticipant = typeof eventParticipants.$inferInsert
