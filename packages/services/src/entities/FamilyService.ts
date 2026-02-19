import { and, asc, eq, ilike, inArray, sql } from 'drizzle-orm'
 
import * as schema from '@peeps/db/schema'
import { db, withTx } from '@peeps/db/client'
import type { PaginatedResponse, PaginationParams, WithTx } from '@peeps/types'
import { decodeOffsetCursor, encodeOffsetCursor, formatStub } from '@peeps/utils'
import { GovernanceModel, GroupRole, GroupType, MembershipStatus, RemovalPolicy, GroupPrivacyLevel } from '@peeps/db/schema/enums'
import { Logger } from '@peeps/utils'

const logger = Logger.instance('FamilyService')

type ListFamiliesParams = {
  pagination: PaginationParams
}

type SearchFamiliesParams = {
  query     : string
  pagination: PaginationParams
}

type FamilyByGroupIdParams = {
  groupId: string
}

type FamiliesByStubForMemberParams = {
  stub    : string
  personId: string
}

type CreateFamilyParams = {
  memberId     : string
  personId     : string
  name         : string
  description ?: string
  privacyLevel : (typeof GroupPrivacyLevel)[keyof typeof GroupPrivacyLevel]
  governanceModel: (typeof GovernanceModel)[keyof typeof GovernanceModel]
  removalPolicy  : (typeof RemovalPolicy)[keyof typeof RemovalPolicy]
  voteThreshold ?: number | null
}

export class FamilyService {
  /**
   * Lists Family + Group rows (Group is the authoritative name/type record).
   * 
   * Database Operations (local scope only):
   * - SELECT: groups (count)
   * - SELECT: groups (page query, joined with families)
   * 
   * External Calls:
   * - {@link decodeOffsetCursor} (cursor -> offset)
   * - {@link encodeOffsetCursor} (offset -> cursor)
   * 
   * @param params - { pagination, tx }
   * 
   * DB SCOPE:
   * - calls : 2
   * - tables: 2 (groups, families)
   * - scope : ✅ CLEAN
   */
  @withTx
  static async list(params: WithTx<ListFamiliesParams>): Promise<PaginatedResponse<{ families: schema.Family; groups: schema.Group }>> {
    const limit = params.pagination.limit
    const offset = decodeOffsetCursor(params.pagination.cursor)

    const [totalRow] = await params.tx!
      .select({ count: sql<number>`count(*)` })
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(eq(schema.groups.type, GroupType.FAMILY))

    const total = Number(totalRow?.count ?? 0)

    const data = await params.tx!
      .select()
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(eq(schema.groups.type, GroupType.FAMILY))
      .orderBy(asc(schema.groups.name))
      .limit(limit)
      .offset(offset)

    const hasNextPage = offset + data.length < total

    return {
      items   : data,
      pageInfo: {
        nextCursor : hasNextPage ? encodeOffsetCursor(offset + limit) : null,
        hasNextPage,
      },
    }
  }

  /**
   * Creates a new Family (Group + Family rows) and grants creator admin membership.
   *
   * @param params - { memberId, personId, name, description?, privacyLevel, governanceModel, removalPolicy, voteThreshold? }
   */
  @withTx
  static async create(params: WithTx<CreateFamilyParams>) {
    const { memberId, personId, name, description, privacyLevel, governanceModel, removalPolicy, voteThreshold } = params

    const [group] = await params.tx!
      .insert(schema.groups)
      .values({
        name,
        stub             : formatStub(name),
        createdByMemberId: memberId,
        type             : GroupType.FAMILY,
        voteThreshold    : voteThreshold ?? null,
        description,
        privacyLevel,
        governanceModel,
        removalPolicy,
      })
      .returning()

    const [family] = await params.tx!
      .insert(schema.families)
      .values({ groupId: group.id })
      .returning()

    await params.tx!.insert(schema.groupMemberships).values({
      groupId : group.id,
      role    : GroupRole.ADMIN,
      status  : MembershipStatus.ACTIVE,
      personId,
    })

    return { families: family, groups: group }
  }

  /**
   * Searches families by Group name, returning Family + Group rows.
   * 
   * Database Operations (local scope only):
   * - SELECT: groups (count, joined with families)
   * - SELECT: groups (page query, joined with families)
   * 
   * External Calls:
   * - {@link decodeOffsetCursor} (cursor -> offset)
   * - {@link encodeOffsetCursor} (offset -> cursor)
   * 
   * @param params - { query, pagination, tx }
   * 
   * DB SCOPE:
   * - calls : 2
   * - tables: 2 (groups, families)
   * - scope : ✅ CLEAN
   */
  @withTx
  static async search(params: WithTx<SearchFamiliesParams>): Promise<PaginatedResponse<{ families: schema.Family; groups: schema.Group }>> {
    const query = params.query.trim()

    const limit = params.pagination.limit
    const offset = decodeOffsetCursor(params.pagination.cursor)

    const where = query.length > 0
      ? and(eq(schema.groups.type, GroupType.FAMILY), ilike(schema.groups.name, `%${query}%`))
      : eq(schema.groups.type, GroupType.FAMILY)

    const [totalRow] = await params.tx!
      .select({ count: sql<number>`count(*)` })
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(where)

    const total = Number(totalRow?.count ?? 0)

    const data = await params.tx!
      .select()
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(where)
      .orderBy(asc(schema.groups.name))
      .limit(limit)
      .offset(offset)

    const hasNextPage = offset + data.length < total

    return {
      items   : data,
      pageInfo: {
        nextCursor : hasNextPage ? encodeOffsetCursor(offset + limit) : null,
        hasNextPage,
      },
    }
  }

  /**
   * Fetches a Family + Group row by Group id.
   * 
   * Database Operations (local scope only):
   * - SELECT: groups (joined with families)
   * 
   * External Calls:
   * - (none)
   * 
   * @param params - { groupId, tx }
   * 
   * DB SCOPE:
   * - calls : 1
   * - tables: 2 (groups, families)
   * - scope : ✅ CLEAN
   */
  @withTx
  static async byGroupId(
    params: WithTx<FamilyByGroupIdParams>,
  ): Promise<{ families: schema.Family; groups: schema.Group } | undefined> {
    const [row] = await params.tx!
      .select()
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(and(
        eq(schema.groups.id, params.groupId),
        eq(schema.groups.type, GroupType.FAMILY),
      ))
      .limit(1)

    return row
  }

  /**
   * Lists every {@link schema.Family} + {@link schema.Group} pair that matches the given stub and that the requesting member belongs to,
   * then hydrates each result with the caller’s membership row plus the roster of active members (membership + person profile) for those families.
   * 
   * Database Operations (local scope only):
   * - SELECT: groups ⇄ families ⇄ group_memberships (fetch caller’s memberships filtered by stub + personId)
   * - SELECT: group_memberships ⇄ persons (load active members for the matched group ids)
   * 
   * External Calls:
   * - (none)
   * 
   * @param params - {@link WithTx<FamiliesByStubForMemberParams>} stub slug and requesting person id (with optional tx)
   * @returns Array of families with caller membership + all active members
   * 
   * DB SCOPE:
   * - calls : 2
   * - tables: 4 (groups, families, group_memberships, persons)
   * - scope : ✅ CLEAN
   * 
   * ❗ WARNING
   * - Method >50 LOC
   */
  @withTx
  static async listByStubForMember(
    params: WithTx<FamiliesByStubForMemberParams>,
  ): Promise<Array<{ families: schema.Family; groups: schema.Group; membership: schema.GroupMembership }>> {
    const normalizedStub = formatStub(params.stub)
    if (!normalizedStub) return []

    const rows: Array<{ families: schema.Family; groups: schema.Group; membership: schema.GroupMembership }> = await params.tx!
      .select({
        families  : schema.families,
        groups    : schema.groups,
        membership: schema.groupMemberships,
      })
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .innerJoin(schema.groupMemberships, eq(schema.groupMemberships.groupId, schema.groups.id))
      .where(and(
        eq(schema.groups.type, GroupType.FAMILY),
        eq(schema.groups.stub, normalizedStub),
        eq(schema.groupMemberships.personId, params.personId),
      ))
      .orderBy(asc(schema.groups.createdAt))

    const groupIds = Array.from(new Set(rows.map((row) => row.groups.id)))
    if (groupIds.length === 0) return []

    const memberRows: Array<{ membership: schema.GroupMembership; person: schema.Person }> = await params.tx!
      .select({
        membership: schema.groupMemberships,
        person    : schema.persons,
      })
      .from(schema.groupMemberships)
      .innerJoin(schema.persons, eq(schema.persons.id, schema.groupMemberships.personId))
      .where(and(
        inArray(schema.groupMemberships.groupId, groupIds),
        eq(schema.groupMemberships.status, MembershipStatus.ACTIVE),
      ))
      .orderBy(asc(schema.groupMemberships.joinedAt))

    const membersByGroup = new Map<string, Array<{ membership: schema.GroupMembership; person: schema.Person }>>()
    for (const memberRow of memberRows) {
      const bucket = membersByGroup.get(memberRow.membership.groupId) ?? []
      bucket.push(memberRow)
      membersByGroup.set(memberRow.membership.groupId, bucket)
    }

    return rows.map((row) => ({
      families  : row.families,
      groups    : row.groups,
      membership: row.membership,
      members   : membersByGroup.get(row.groups.id) ?? [],
    }))
  }

  /**
   * Resolves a Family for a member:
   * - If a Group(FAMILY) for the member's primary family name does not exist, creates Group + Family and adds membership.
   * - If it does exist, creates a FamilyJoinRequest.
   * 
   * Database Operations (local scope only):
   * - SELECT: person_family_names
   * - SELECT: groups
   * - *?INSERT: groups*
   * - *?INSERT: families*
   * - *?INSERT: group_memberships*
   * - *?INSERT: family_join_requests*
   * 
   * External Calls:
   * - (none)
   * 
   * @param params - { memberId, personId, tx }
   * @throws Error('Missing family name') when the person has no active family name
   * 
   * DB SCOPE:
   * - calls : 2 + *?4*
   * - tables: 5 (person_family_names, groups, families, group_memberships, family_join_requests)
   * - scope : ❌ VIOLATION
   * 
   * ❗ WARNING
   * - Method is >50 LOC
   */
  @withTx
  static async resolveForMember(params: WithTx<{ memberId: string; personId: string }>): Promise<
    | { kind: 'created'; groupId: string; familyId: string }
    | { kind: 'join_request'; groupId: string; joinRequestId: string }
  > {
    const [primaryFamilyName] = await params.tx!
      .select()
      .from(schema.personFamilyNames)
      .where(and(
        eq(schema.personFamilyNames.personId, params.personId),
        eq(schema.personFamilyNames.active, true),
      ))
      .orderBy(asc(schema.personFamilyNames.order))
      .limit(1)

    if (!primaryFamilyName) {
      throw new Error('Missing family name')
    }

    const [existingGroup] = await params.tx!
      .select()
      .from(schema.groups)
      .where(and(
        eq(schema.groups.type, GroupType.FAMILY),
        eq(schema.groups.name, primaryFamilyName.name),
      ))
      .limit(1)

    if (!existingGroup) {
      const [group] = await params.tx!
        .insert(schema.groups)
        .values({
          name             : primaryFamilyName.name,
          stub             : formatStub(primaryFamilyName.name),
          type             : GroupType.FAMILY,
          createdByMemberId: params.memberId,
          governanceModel  : GovernanceModel.SINGLE_ADMIN,
          removalPolicy    : RemovalPolicy.IMMEDIATE,
        })
        .returning()

      const [family] = await params.tx!
        .insert(schema.families)
        .values({ groupId: group.id })
        .returning()

      await params.tx!.insert(schema.groupMemberships).values({
        groupId : group.id,
        personId: params.personId,
        role    : GroupRole.ADMIN,
        status  : MembershipStatus.ACTIVE,
      })

      return { kind: 'created', groupId: group.id, familyId: family.id }
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

    const [joinRequest] = await params.tx!
      .insert(schema.familyJoinRequests)
      .values({ memberId: params.memberId, groupId: existingGroup.id, expiresAt })
      .returning()

    return { kind: 'join_request', groupId: existingGroup.id, joinRequestId: joinRequest.id }
  }

  static async getGroupIdsForMember({ memberId }: { memberId: string }): Promise<string[]> {
    const rows = await db
      .select({ groupId: schema.groupMemberships.groupId })
      .from(schema.members)
      .innerJoin(schema.groupMemberships, eq(schema.groupMemberships.personId, schema.members.personId))
      .innerJoin(schema.groups, eq(schema.groups.id, schema.groupMemberships.groupId))
      .where(and(
        eq(schema.members.id,              memberId),
        eq(schema.groupMemberships.status, MembershipStatus.ACTIVE),
        eq(schema.groups.type,             GroupType.FAMILY),
      ))

    return rows.map((r: { groupId: string }) => r.groupId)
  }
}
