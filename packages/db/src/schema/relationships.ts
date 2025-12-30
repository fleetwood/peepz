import { pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

import { enumColumn } from '@peeps/utils'

import { BaseFields } from './base'
import { persons } from './persons'

export const RelationshipRole = {
  PARENT      : 'PARENT',
  CHILD       : 'CHILD',
  SIBLING     : 'SIBLING',
  SPOUSE      : 'SPOUSE',
  PARTNER     : 'PARTNER',
  GRANDPARENT : 'GRANDPARENT',
  GRANDCHILD  : 'GRANDCHILD',
  PIBLING     : 'PIBLING',
  NIBLING     : 'NIBLING',
  COUSIN      : 'COUSIN',
} as const

export const RelationshipRoleLabels = {
  PARENT      : { neutral: 'PARENT',      male: 'FATHER',      female: 'MOTHER' },
  CHILD       : { neutral: 'CHILD',       male: 'SON',         female: 'DAUGHTER' },
  SIBLING     : { neutral: 'SIBLING',     male: 'BROTHER',     female: 'SISTER' },
  SPOUSE      : { neutral: 'SPOUSE',      male: 'HUSBAND',     female: 'WIFE' },
  PARTNER     : { neutral: 'PARTNER',     male: 'PARTNER',     female: 'PARTNER' },
  GRANDPARENT : { neutral: 'GRANDPARENT', male: 'GRANDFATHER', female: 'GRANDMOTHER' },
  GRANDCHILD  : { neutral: 'GRANDCHILD',  male: 'GRANDSON',    female: 'GRANDDAUGHTER' },
  PIBLING     : { neutral: 'PIBLING',     male: 'UNCLE',       female: 'AUNT' },
  NIBLING     : { neutral: 'NIBLING',     male: 'NEPHEW',      female: 'NIECE' },
  COUSIN      : { neutral: 'COUSIN',      male: 'COUSIN',      female: 'COUSIN' },
} as const


export const RelationshipStatus = {
  ACTIVE : 'ACTIVE',
  PENDING: 'PENDING',
} as const

/**
 * Relationships store both sides' roles for UX.
 *
 * Storage invariant (enforced by app code):
 * - For lineage relationships: elder generation is stored as `subjectPersonId`
 * - For lateral/affinal relationships: older DOB is stored as `subjectPersonId`
 * - Tie-breaker: earliest `createdAt`
 */
export const relationships = pgTable(
  'relationships',
  {
    ...BaseFields,

    subjectPersonId        : uuid('subject_person_id').notNull().references(() => persons.id),
    relativePersonId       : uuid('relative_person_id').notNull().references(() => persons.id),
    subjectRelation        : enumColumn('subject_relation', RelationshipRole).notNull(),
    relativeRelation       : enumColumn('relative_relation', RelationshipRole).notNull(),
    status                 : enumColumn('status', RelationshipStatus).notNull().default('PENDING'),
    confirmedByPersonIds   : uuid('confirmed_by_person_ids').array().notNull().default(sql`ARRAY[]::uuid[]`),
  },
  (t) => [
    uniqueIndex('relationships_subject_relative_roles_unique').on(
      t.subjectPersonId,
      t.relativePersonId,
      t.subjectRelation,
      t.relativeRelation,
    ),
  ],
)

export type Relationship = typeof relationships.$inferSelect
export type NewRelationship = typeof relationships.$inferInsert
