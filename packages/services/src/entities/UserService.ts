import { eq, sql } from 'drizzle-orm'

import * as schema from '@peeps/db/schema'
import { withTx } from '@peeps/db/client'
import { ErrorCodeEnum, errorCodeToStatusCode } from '@peeps/types'
import type { ServiceResult, UserDto } from '@peeps/types'

type WithTx<TParams> = TParams & { tx?: any }

type ByAuthUserIdParams = {
  authUserId: string
  email     : string
}

// Type definition for the query result
type UserQueryResult = {
  member: typeof schema.members.$inferSelect
  person: typeof schema.persons.$inferSelect
  groupMembership: typeof schema.groupMemberships.$inferSelect | null
  group: typeof schema.groups.$inferSelect | null
  family: typeof schema.families.$inferSelect | null
  familyJoinRequest: typeof schema.familyJoinRequests.$inferSelect | null
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function toIsoDay(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

export class UserService {
  @withTx
  static async byAuthUserId(params: WithTx<ByAuthUserIdParams>): Promise<ServiceResult<UserDto>> {
    // Query with direct joins
    const result = await params.tx!
      .select({
        member: schema.members,
        person: schema.persons,
        groupMembership: schema.groupMemberships,
        group: schema.groups,
        family: schema.families,
        familyJoinRequest: schema.familyJoinRequests,
      })
      .from(schema.members)
      .innerJoin(schema.persons, eq(schema.persons.id, schema.members.personId))
      .leftJoin(schema.groupMemberships, eq(schema.groupMemberships.personId, schema.persons.id))
      .leftJoin(schema.groups, eq(schema.groups.id, schema.groupMemberships.groupId))
      .leftJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .leftJoin(schema.familyJoinRequests, eq(schema.familyJoinRequests.memberId, schema.members.id))
      .where(eq(schema.members.authUserId, params.authUserId))

    if (!result.length) {
      throw {
        error     : 'User not found',
        code      : ErrorCodeEnum.AUTH_USER_NOT_FOUND,
        statusCode: errorCodeToStatusCode[ErrorCodeEnum.AUTH_USER_NOT_FOUND],
      }
    }

      // Extract and deduplicate data
    const userRow = result[0]
    
    const familiesMap = new Map<string, UserDto['families'][0]>()
    const joinRequestsMap = new Map<string, UserDto['familyJoinRequests'][0]>()
    
    for (const row of result) {
      if (row.family && row.group && row.family.visible && !familiesMap.has(row.family.id)) {
        familiesMap.set(row.family.id, {
          id: row.family.id,
          name: row.group.name,
          createdAt: toIsoDate(row.family.createdAt),
          updatedAt: toIsoDate(row.family.updatedAt),
          visible: row.family.visible,
        })
      }
      
      if (row.familyJoinRequest && row.familyJoinRequest.status !== 'ACCEPTED' && !joinRequestsMap.has(row.familyJoinRequest.id)) {
        joinRequestsMap.set(row.familyJoinRequest.id, {
          id: row.familyJoinRequest.id,
          familyId: row.familyJoinRequest.familyId,
          memberId: row.familyJoinRequest.memberId,
          status: row.familyJoinRequest.status,
          createdAt: toIsoDate(row.familyJoinRequest.createdAt),
          updatedAt: toIsoDate(row.familyJoinRequest.updatedAt),
        })
      }
    }
    
    const families = Array.from(familiesMap.values())
    const joinRequests = Array.from(joinRequestsMap.values())

    // Calculate onboarding status
    const needsOnboarding = families.length === 0 && joinRequests.length === 0

    return {
      status: 200,
      result: {
        // UserPersonDto fields
        id           : userRow.person.id,
        name         : userRow.person.name,
        dateOfBirth  : toIsoDay(userRow.person.dateOfBirth),
        preferredName: userRow.person.preferredName ?? null,
        createdAt    : toIsoDate(userRow.person.createdAt),
        updatedAt    : toIsoDate(userRow.person.updatedAt),
        visible      : userRow.person.visible,
        
        // Additional UserDto fields
        member: {
          id          : userRow.member.id,
          personId    : userRow.member.personId,
          authUserId  : userRow.member.authUserId,
          email       : userRow.member.email,
          privacyLevel: userRow.member.privacyLevel as UserDto['member']['privacyLevel'],
          createdAt   : toIsoDate(userRow.member.createdAt),
          updatedAt   : toIsoDate(userRow.member.updatedAt),
          visible     : userRow.member.visible,
        },
        auth: {
          authUserId: params.authUserId,
          email     : params.email,
        },
        fullName: userRow.person.name.join(' '), // For now, just use person.name
        
        // Families and join requests
        families: families,
        familyJoinRequests: joinRequests,
        
        // Service-level determination
        needsOnboarding: needsOnboarding,
      },
    }
  }
}
