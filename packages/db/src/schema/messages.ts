import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

import { enumColumn } from '@peeps/utils'

import { BaseFields } from './base'
import { members } from './members'
import { threads } from './threads'

export const MessageType = {
  TEXT   : 'TEXT',
  IMAGE  : 'IMAGE',
  FILE   : 'FILE',
  SYSTEM : 'SYSTEM',
} as const

export const ExternalSource = {
  EMAIL    : 'EMAIL',
  SMS      : 'SMS',
  WHATSAPP : 'WHATSAPP',
  TELEGRAM : 'TELEGRAM',
} as const

export const messages = pgTable(
  'messages',
  {
    ...BaseFields,

    threadId           : uuid('thread_id').notNull().references(() => threads.id),
    createdByMemberId  : uuid('created_by_member_id').notNull().references(() => members.id),

    content            : text('content').notNull().default(''),
    messageType        : enumColumn('message_type', MessageType).notNull().default('TEXT'),

    externalSource     : enumColumn('external_source', ExternalSource),
    externalMessageId  : varchar('external_message_id', { length: 255 }),

    attachments        : jsonb('attachments').notNull().default(sql`'[]'::jsonb`),

    sentAt             : timestamp('sent_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    editedAt           : timestamp('edited_at', { mode: 'date', withTimezone: true }),
    deletedAt          : timestamp('deleted_at', { mode: 'date', withTimezone: true }),
  },
  (t) => [
    index('messages_thread_sent_at_idx').on(t.threadId, t.sentAt),
  ],
)

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
