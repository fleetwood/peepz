import { and, asc, eq, ilike, sql } from 'drizzle-orm'
 
import * as schema from '@peeps/db/schema'
import { type WithTx, withTx } from '@peeps/db/client'
import type { PaginatedResponse, PaginationParams } from '@peeps/types'
 
import { decodeOffsetCursor, encodeOffsetCursor } from '@peeps/utils'
 
import { GovernanceModel, GroupRole, GroupType, MembershipStatus, RemovalPolicy } from '@peeps/db/schema/enums'

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
}
