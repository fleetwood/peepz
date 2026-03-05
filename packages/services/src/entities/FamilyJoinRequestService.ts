import { and, eq, sql } from 'drizzle-orm'

import { withTx, type WithTx } from '@peeps/db/client'
import * as schema from '@peeps/db/schema'
import { GroupRole, MembershipStatus, RequestStatus } from '@peeps/db/schema/enums'
import type { ApproveRequestInput, CreateJoinRequestInput, UpdateRelationshipsInput } from '@peeps/types'
import { Logger } from '@peeps/utils'

import { NotificationFactories } from '../integrations/NotificationFactories'
import { NotificationService } from '../integrations/NotificationService'

const logger = Logger.instance('FamilyJoinRequestService')

type GetJoinRequestParams = {
  requestId: string
}

type GetJoinRequestByMemberAndFamilyParams = {
  memberId: string
  groupId : string
}

type CreateJoinRequestServiceParams = CreateJoinRequestInput & {
  memberId: string
}

type ApproveJoinRequestParams = ApproveRequestInput & {
  requestId    : string
  actorMemberId: string
}

type UpdateRelationshipsParams = UpdateRelationshipsInput & {
  requestId: string
}

export class FamilyJoinRequestService {
  /**
   * Gets a join request by id.
   *
   * Retrieves a single family join request record by its unique identifier.
   *
   * Database Operations:
   * - SELECT: family_join_requests
   *
   * @param params - Object containing requestId and optional transaction
   * @param params.requestId - The unique identifier of the join request
   * @param params.tx - Optional database transaction
   * @returns The join request record or undefined if not found
   *
   * DB SCOPE:
   * - calls: 1
   * - tables: 1 (family_join_requests)
   * - scope: ✅ CLEAN
   */
  @withTx
  static async get(params: WithTx<GetJoinRequestParams>): Promise<schema.FamilyJoinRequest | undefined> {
    const [row] = await params.tx!
      .select()
      .from(schema.familyJoinRequests)
      .where(eq(schema.familyJoinRequests.id, params.requestId))
      .limit(1)

    return row
  }

  /**
   * Gets a join request by member and family.
   *
   * Retrieves the active join request for a specific member within a specific family.
   *
   * Database Operations:
   * - SELECT: family_join_requests
   *
   * @param params - Object containing memberId, groupId, and optional transaction
   * @param params.memberId - The member's unique identifier
   * @param params.groupId - The family's group identifier
   * @param params.tx - Optional database transaction
   * @returns The join request record or undefined if not found
   *
   * DB SCOPE:
   * - calls: 1
   * - tables: 1 (family_join_requests)
   * - scope: ✅ CLEAN
   */
  @withTx
  static async getByMemberAndFamily(
    params: WithTx<GetJoinRequestByMemberAndFamilyParams>,
  ): Promise<schema.FamilyJoinRequest | undefined> {
    const [row] = await params.tx!
      .select()
      .from(schema.familyJoinRequests)
      .where(
        and(
          eq(schema.familyJoinRequests.memberId, params.memberId),
          eq(schema.familyJoinRequests.groupId, params.groupId),
        ),
      )
      .limit(1)

    return row
  }

  /**
   * Creates a new join request for a member to join a family.
   *
   * Creates a pending join request and notifies family admins. Checks for existing
   * active requests before creation to prevent duplicates.
   *
   * Database Operations:
   * - SELECT: family_join_requests (check for existing active request)
   * - INSERT: family_join_requests
   * - SELECT: group_memberships (find admin members)
   * - SELECT: members (get requesting member info)
   * - **!INSERT: notifications (create notification for each admin)**
   *
   * External Calls:
   * - WebSocket broadcast (for real-time updates to present admins)
   *
   * @param params - Object containing memberId, familyId, inviteCode, and optional transaction
   * @param params.memberId - The requesting member's unique identifier
   * @param params.familyId - The target family's group identifier
   * @param params.inviteCode - Optional invite code for verification
   * @param params.tx - Optional database transaction
   * @returns The created join request record
   * @throws Error if an active request already exists
   *
   * DB SCOPE:
   * - calls: 4 + N (where N = number of admins for notifications)
   * - tables: 4 (family_join_requests, group_memberships, members, notifications)
   * - scope: ❌ VIOLATION - Direct INSERT into notifications table should delegate to NotificationService
   *
   * ❗ WARNING: Method is 76 lines (exceeds 50 line limit)
   */
  @withTx
  static async create(params: WithTx<CreateJoinRequestServiceParams>): Promise<schema.FamilyJoinRequest> {
    const { memberId, familyId, inviteCode } = params

    // Check for existing active request
    const existingRequest = await params.tx!
      .select()
      .from(schema.familyJoinRequests)
      .where(
        and(
          eq(schema.familyJoinRequests.memberId, memberId),
          eq(schema.familyJoinRequests.groupId, familyId),
          eq(schema.familyJoinRequests.status, RequestStatus.PENDING),
        ),
      )
      .limit(1)

    if (existingRequest.length > 0) {
      throw new Error('Active join request already exists for this member and family')
    }

    // Calculate expiration (7 days from now)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

    // Create the join request
    const [joinRequest] = await params.tx!
      .insert(schema.familyJoinRequests)
      .values({
        memberId,
        groupId: familyId,
        expiresAt,
        status: RequestStatus.PENDING,
        confirmations: [],
        claimedRelationships: [],
      })
      .returning()

    // Get family admins and requesting member info in parallel (independent queries)
    const [adminMemberships, requestingMember] = await Promise.all([
      params.tx!
        .select({
          membership: schema.groupMemberships,
          person    : schema.persons,
        })
        .from(schema.groupMemberships)
        .innerJoin(schema.persons, eq(schema.persons.id, schema.groupMemberships.personId))
        .where(
          and(
            eq(schema.groupMemberships.groupId, familyId),
            eq(schema.groupMemberships.role, GroupRole.ADMIN),
          ),
        ),
      params.tx!
        .select({
          member: schema.members,
          person: schema.persons,
        })
        .from(schema.members)
        .innerJoin(schema.persons, eq(schema.persons.id, schema.members.personId))
        .where(eq(schema.members.id, memberId))
        .limit(1)
        .then((rows: Array<{ member: schema.Member; person: schema.Person }>) => rows[0]),
    ])

    // Create notifications for offline admins using NotificationService
    // Note: Real-time notifications for present admins are handled via WebSocket
    for (const admin of adminMemberships) {
      if (requestingMember) {
        const notificationInput = NotificationFactories.joinRequest({
          memberId        : admin.membership.personId,
          requesterName   : `${requestingMember.person.firstName} ${requestingMember.person.lastName}`,
          familyName      : '', // TODO: Get family name from family query
          familyId        : familyId,
          requestId       : joinRequest.id,
          requesterMemberId: memberId,
        })
        await NotificationService.create(notificationInput)
      }
    }

    return joinRequest
  }

  /**
   * Records an approval/confirmation for a join request.
   *
   * Adds a confirmation to a join request and checks if approval threshold is met.
   * If approved, creates a group membership for the requesting member.
   *
   * Approval rules: 1 admin confirmation OR 2 non-admin member confirmations
   *
   * Database Operations:
   * - SELECT: family_join_requests (with members join for personId)
   * - UPDATE: family_join_requests (add confirmation, recompute status)
   * - *?INSERT: group_memberships (if approval threshold met)*
   *
   * @param params - Object containing requestId, actorMemberId, confirmationType, and optional transaction
   * @param params.requestId - The join request unique identifier
   * @param params.actorMemberId - The confirming member's unique identifier
   * @param params.confirmationType - The confirmation type (ADMIN or MEMBER)
   * @param params.tx - Optional database transaction
   * @returns The updated join request record
   * @throws Error if request not found
   * @throws Error if request already approved or rejected
   * @throws Error if request has expired
   * @throws Error if actor already confirmed
   *
   * DB SCOPE:
   * - calls: 2-3
   * - tables: 2 (family_join_requests, group_memberships)
   * - scope: ⚠️  EDGE CASE - INSERT into group_memberships may belong to GroupService, but is part of the approval workflow. Consider delegating.
   *
   * ❗ WARNING: Method is 76 lines (exceeds 50 line limit)
   */
  @withTx
  static async approve(params: WithTx<ApproveJoinRequestParams>): Promise<schema.FamilyJoinRequest> {
    const { requestId, actorMemberId, confirmationType } = params

    // Get the join request with member's personId in a single query
    const [joinRequestWithMember] = await params.tx!
      .select({
        joinRequest: schema.familyJoinRequests,
        memberPersonId: schema.members.personId,
      })
      .from(schema.familyJoinRequests)
      .innerJoin(schema.members, eq(schema.members.id, schema.familyJoinRequests.memberId))
      .where(eq(schema.familyJoinRequests.id, requestId))
      .limit(1)

    if (!joinRequestWithMember) {
      throw new Error('Join request not found')
    }

    const { joinRequest, memberPersonId } = joinRequestWithMember

    if (joinRequest.status === RequestStatus.APPROVED) {
      throw new Error('Join request already approved')
    }

    if (joinRequest.status === RequestStatus.REJECTED) {
      throw new Error('Join request already rejected')
    }

    // Check if request is expired
    if (new Date() > joinRequest.expiresAt) {
      throw new Error('Join request has expired')
    }

    // Check if actor already confirmed
    const existingConfirmations = (joinRequest.confirmations as Array<{ memberId: string; type: string }>) || []
    if (existingConfirmations.some((c) => c.memberId === actorMemberId)) {
      throw new Error('You have already confirmed this request')
    }

    // Add the new confirmation
    const newConfirmation = {
      memberId: actorMemberId,
      type    : confirmationType,
      createdAt: new Date().toISOString(),
    }
    const updatedConfirmations = [...existingConfirmations, newConfirmation]

    // Count approvals
    const adminConfirmations = updatedConfirmations.filter((c) => c.type === GroupRole.ADMIN).length
    const memberConfirmations = updatedConfirmations.filter((c) => c.type === GroupRole.MEMBER).length

    // Determine new status (1 admin OR 2 non-admin members required)
    const isApproved = adminConfirmations >= 1 || memberConfirmations >= 2
    const newStatus = isApproved ? RequestStatus.APPROVED : RequestStatus.PENDING

    // Update the join request
    const [updatedRequest] = await params.tx!
      .update(schema.familyJoinRequests)
      .set({
        confirmations: updatedConfirmations,
        status       : newStatus,
      })
      .where(eq(schema.familyJoinRequests.id, requestId))
      .returning()

    // If approved, create group membership and send approval notification
    if (isApproved) {
      await params.tx!.insert(schema.groupMemberships).values({
        groupId : joinRequest.groupId,
        personId: memberPersonId,
        role    : GroupRole.MEMBER,
        status  : MembershipStatus.ACTIVE,
      })

      // Send approval notification to requester
      // TODO: Get approver name and family name from queries
      const approvalNotification = NotificationFactories.joinRequestApproval({
        memberId  : joinRequest.memberId,
        approverName: '', // TODO: Get approver name
        familyName: '', // TODO: Get family name
        familyId  : joinRequest.groupId,
        requestId : joinRequest.id,
      })
      await NotificationService.create(approvalNotification)
    }

    return updatedRequest
  }

  /**
   * Updates claimed relationships for a join request.
   *
   * Validates that all target members exist in the family and updates
   * the claimed relationships array on the join request.
   *
   * Database Operations:
   * - SELECT: family_join_requests (with members join for personId)
   * - SELECT: group_memberships (validate targets are in family)
   * - UPDATE: family_join_requests
   *
   * @param params - Object containing requestId, relationships, and optional transaction
   * @param params.requestId - The join request unique identifier
   * @param params.relationships - Array of claimed relationships to set
   * @param params.tx - Optional database transaction
   * @returns The updated join request record
   * @throws Error if request not found
   * @throws Error if any target member is not in the family
   * @throws Error if attempting to declare relationship to self
   *
   * DB SCOPE:
   * - calls: 3
   * - tables: 3 (family_join_requests, members, group_memberships)
   * - scope: ⚠️  EDGE CASE - SELECT from group_memberships for validation; may belong to GroupService but is read-only validation. Otherwise ✅ CLEAN
   *
   * ❗ WARNING: Method is 66 lines (exceeds 50 line limit)
   */
  @withTx
  static async updateRelationships(
    params: WithTx<UpdateRelationshipsParams>,
  ): Promise<schema.FamilyJoinRequest> {
    const { requestId, relationships } = params

    // Get the join request with member's personId in a single query
    const [joinRequestWithMember] = await params.tx!
      .select({
        joinRequest: schema.familyJoinRequests,
        memberPersonId: schema.members.personId,
      })
      .from(schema.familyJoinRequests)
      .innerJoin(schema.members, eq(schema.members.id, schema.familyJoinRequests.memberId))
      .where(eq(schema.familyJoinRequests.id, requestId))
      .limit(1)

    if (!joinRequestWithMember) {
      throw new Error('Join request not found')
    }

    const { joinRequest, memberPersonId: requestingPersonId } = joinRequestWithMember

    // Validate that all target members are in the family
    const targetMemberIds = relationships.map((r: { targetMemberId: string }) => r.targetMemberId)

    if (targetMemberIds.length > 0) {
      const familyMembers = await params.tx!
        .select({ personId: schema.groupMemberships.personId })
        .from(schema.groupMemberships)
        .where(
          and(
            eq(schema.groupMemberships.groupId, joinRequest.groupId),
            eq(schema.groupMemberships.status, MembershipStatus.ACTIVE),
          ),
        )

      const familyMemberIds = new Set<string>(familyMembers.map((m: { personId: string }) => m.personId))

      // Check that targets are in family (excluding the requesting member)
      for (const targetId of targetMemberIds) {
        if (targetId === requestingPersonId) {
          throw new Error('Cannot declare relationship to yourself')
        }
        if (!familyMemberIds.has(targetId)) {
          throw new Error(`Target member ${targetId} is not in the family`)
        }
      }
    }

    // Update the relationships
    const [updatedRequest] = await params.tx!
      .update(schema.familyJoinRequests)
      .set({
        claimedRelationships: relationships,
      })
      .where(eq(schema.familyJoinRequests.id, requestId))
      .returning()

    return updatedRequest
  }

  /**
   * Lists all pending join requests for a family.
   *
   * Retrieves all join requests with PENDING status for a given family.
   *
   * Database Operations:
   * - SELECT: family_join_requests
   *
   * @param params - Object containing groupId and optional transaction
   * @param params.groupId - The family's group identifier
   * @param params.tx - Optional database transaction
   * @returns Array of pending join request records
   *
   * DB SCOPE:
   * - calls: 1
   * - tables: 1 (family_join_requests)
   * - scope: ✅ CLEAN
   */
  @withTx
  static async listPendingForFamily(
    params: WithTx<{ groupId: string }>,
  ): Promise<schema.FamilyJoinRequest[]> {
    return await params.tx!
      .select()
      .from(schema.familyJoinRequests)
      .where(
        and(
          eq(schema.familyJoinRequests.groupId, params.groupId),
          eq(schema.familyJoinRequests.status, RequestStatus.PENDING),
        ),
      )
  }

  /**
   * Lists all join requests for a member.
   *
   * Retrieves all join requests (any status) for a specific member,
   * ordered by creation date descending (most recent first).
   *
   * Database Operations:
   * - SELECT: family_join_requests
   *
   * @param params - Object containing memberId and optional transaction
   * @param params.memberId - The member's unique identifier
   * @param params.tx - Optional database transaction
   * @returns Array of join request records
   *
   * DB SCOPE:
   * - calls: 1
   * - tables: 1 (family_join_requests)
   * - scope: ✅ CLEAN
   */
  @withTx
  static async listForMember(
    params: WithTx<{ memberId: string }>,
  ): Promise<schema.FamilyJoinRequest[]> {
    return await params.tx!
      .select()
      .from(schema.familyJoinRequests)
      .where(eq(schema.familyJoinRequests.memberId, params.memberId))
      .orderBy(sql`${schema.familyJoinRequests.createdAt} desc`)
  }
}
