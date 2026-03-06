import { and, eq } from 'drizzle-orm'
import * as schema from '@peeps/db/schema'
import { type WithTx, withTx } from '@peeps/db/client'
import type { EnsureAuthIdentity } from '@peeps/types'
import type { ServiceResult } from '@peeps/types'
import { IdentitiesService } from './IdentitiesService'

import { PersonService } from './PersonService'
import { FamilyService } from './FamilyService'
import { getProviderProfilePatch } from '../auth/providers/profileMapperRegistry'
import { Logger } from '@peeps/utils'

const logger = Logger.instance('MemberService')

type EnsureSupabaseUser = {
  identities?: Array<{
    provider: string
    id?     : string
    user_id?: string
    identity_data?: unknown
  }>
}

type ValidateSupabaseUserParams = {
  authUserId: string
  email     : string
  user      : EnsureSupabaseUser
}

export class MemberService {
  /**
   * Ensures a {@link schema.Member} exists for a Supabase-authenticated user.
   * 
   * Database Operations (local scope only):
   * - (none) (delegates all DB writes/reads)
   * 
   * External Calls:
   * - {@link MemberService.validateAuthUser} (member + identity upsert orchestration)
   * 
   * @param params - {@link ValidateSupabaseUserParams}
   * @throws object when an explicit identity-link flow is required (409)
   * 
   * DB SCOPE:
   * - calls : 0 (local) + delegated
   * - tables: 0 (local)
   * - scope : ✅ clean
   */
  @withTx
  static async validateSupabaseUser(params: ValidateSupabaseUserParams & { tx?: any }): Promise<{ member: schema.Member; onboarding: { needsProfile: boolean; needsFamily: boolean } }> {
    logger.debug('validateSupabaseUser', { params })
    const identities = (params.user.identities ?? [])
      .map((i) => ({
        provider      : i.provider,
        providerUserId: i.id ?? i.user_id ?? '',
        email         : params.email,
        rawProfile    : i.identity_data ?? {},
      }))
      .filter((i) => i.provider && i.providerUserId)

    const validateUser = {
      authUserId : params.authUserId,
      email      : params.email,
      identities,
      tx         : params.tx,
    }
    const ensured = await MemberService.validateAuthUser(validateUser)

    if (!ensured.result) {
      if (ensured.status === 409) {
        logger.debug('Found email, linking required', validateUser)
        throw {
          error      : 'Member exists for email; explicit provider linking required',
          code       : 'AUTH_IDENTITY_LINK_REQUIRED',
          statusCode : 409,
          errorDetails: {
            email   : params.email,
            provider: identities[0]?.provider ?? null,
          },
        }
      }
      
      logger.debug('No matching email found', validateUser, ensured)
      throw {
        error     : 'Failed to ensure member',
        code      : 'AUTH_ENSURE_MEMBER_FAILED',
        statusCode: ensured.status ?? 500,
      }
    }
    
    logger.debug('Member found!', ensured)
    return {
      member    : ensured.result,
      onboarding: {
        needsProfile: true,
        needsFamily : true,
      },
    }
  }

  /**
   * Fetches a {@link schema.Member} by primary id.
   * 
   * TODO: Refactor to return data directly instead of ServiceResult with status codes.
   * Services should not return HTTP status codes; routes should handle HTTP responses.
   * 
   * Database Operations (local scope only):
   * - SELECT: members
   * 
   * External Calls:
   * - (none)
   * 
   * @param params - { id, tx }
   * @returns The member row or null
   * 
   * DB SCOPE:
   * - calls : 1
   * - tables: 1 (members)
   * - scope : 
   */
  @withTx
  static async getById(params: WithTx<{ id: string }>): Promise<ServiceResult<schema.Member | null>> {
    const [member] = await params.tx!.select().from(schema.members).where(eq(schema.members.id, params.id)).limit(1)
    return { status: 200, result: member ?? null }
  }

  /**
   * Fetches a {@link schema.Member} by Supabase auth user id.
   * 
   * TODO: Refactor to return data directly instead of ServiceResult with status codes.
   * Services should not return HTTP status codes; routes should handle HTTP responses.
   * 
   * Database Operations (local scope only):
   * - SELECT: members
   * 
   * External Calls:
   * - (none)
   * 
   * @param params - { authUserId, tx }
   * @returns The member row or null
   * 
   * DB SCOPE:
   * - calls : 1
   * - tables: 1 (members)
   * - scope : 
   */
  @withTx
  static async byAuthUserId(params: WithTx<{ authUserId: string }>): Promise<ServiceResult<schema.Member | null>> {
    const [member] = await params.tx!
      .select()
      .from(schema.members)
      .where(eq(schema.members.authUserId, params.authUserId))
      .limit(1)
    return { status: 200, result: member ?? null }
  }

  /**
   * Fetches a {@link schema.Member} by email.
   * 
   * TODO: Refactor to return data directly instead of ServiceResult with status codes.
   * Services should not return HTTP status codes; routes should handle HTTP responses.
   * 
   * Database Operations (local scope only):
   * - SELECT: members
   * 
   * External Calls:
   * - (none)
   * 
   * @param params - { email, tx }
   * @returns The member row or null
   * 
   * DB SCOPE:
   * - calls : 1
   * - tables: 1 (members)
   * - scope : 
   */
  @withTx
  static async byEmail(params: WithTx<{ email: string }>): Promise<ServiceResult<schema.Member | null>> {
    const [member] = await params.tx!
      .select()
      .from(schema.members)
      .where(eq(schema.members.email, params.email))
      .limit(1)
    return { status: 200, result: member ?? null }
  }

  /**
   * Ensures a {@link schema.Member} exists for the auth user id and email.
   * 
   * TODO: Refactor to throw domain errors instead of returning status codes.
   * Services should not return HTTP status codes (200, 409, 201); routes should handle HTTP responses.
   * 
   * Database Operations (local scope only):
   * - *?INSERT: members (create member if missing)*
   * 
   * External Calls:
   * - {@link MemberService.byAuthUserId} (lookup)
   * - {@link MemberService.byEmail} (conflict check)
   * - {@link PersonService.createFromEmail} (person creation)
   * - {@link PersonService.applyBestEffortProfilePatch} (best-effort profile persistence)
   * - {@link IdentitiesService.upsertAuthIdentities} (identity persistence)
   * - {@link getProviderProfilePatch} (provider-owned mapping)
   * 
   * @param params - { authUserId, email, identities?, tx }
   * @returns 200 existing member or 201 created member
   * 
   * DB SCOPE:
   * - calls : 1 (local) + delegated
   * - tables: 1 (local: members)
   * - scope : 
   */
  @withTx
  static async validateAuthUser(params: WithTx<{ authUserId: string; email: string; identities?: EnsureAuthIdentity[] }>): Promise<ServiceResult<schema.Member>> {
    const existing = await MemberService.byAuthUserId({ authUserId: params.authUserId, tx: params.tx })
    if (existing.result) {
      await IdentitiesService.upsertAuthIdentities({ memberId: existing.result.id, identities: params.identities ?? [], tx: params.tx })

      const patch = getProviderProfilePatch({
        provider   : params.identities?.[0]?.provider ?? '',
        identityData: params.identities?.[0]?.rawProfile ?? {},
      })

      await PersonService.applyBestEffortProfilePatch({ personId: existing.result.personId, patch, tx: params.tx })

      return { status: 200, result: existing.result }
    }

    const existingByEmail = await MemberService.byEmail({ email: params.email, tx: params.tx })
    if (existingByEmail.result) {
      return { status: 409, error: 'Member exists for email; explicit provider linking required' }
    }

    const patch = getProviderProfilePatch({
      provider   : params.identities?.[0]?.provider ?? '',
      identityData: params.identities?.[0]?.rawProfile ?? {},
    })

    const person = await PersonService.createFromEmail({ email: params.email, tx: params.tx })

    const [member] = await params.tx!
      .insert(schema.members)
      .values({ authUserId: params.authUserId, email: params.email, personId: person.id })
      .returning()

    await PersonService.applyBestEffortProfilePatch({ personId: person.id, patch, tx: params.tx })

    await IdentitiesService.upsertAuthIdentities({ memberId: member.id, identities: params.identities ?? [], tx: params.tx })

    return { status: 201, result: member }
  }

  /**
   * Updates the member's Person profile fields and replaces family name rows.
   * 
   * TODO: Refactor to throw domain errors (NotFoundError) instead of returning status codes.
   * Services should not return HTTP status codes (404, 200); routes should handle HTTP responses.
   * 
   * Database Operations (local scope only):
   * - (none) (delegates all Person table writes)
   * 
   * External Calls:
   * - {@link MemberService.byAuthUserId} (lookup)
   * - {@link PersonService.updateProfile} (person + family name persistence)
   * 
   * @param params - { authUserId, input, tx }
   * 
   * DB SCOPE:
   * - calls : 0 (local) + delegated
   * - tables: 0 (local)
   * - scope : 
   */
  @withTx
  static async updateProfile(params: WithTx<{
    authUserId: string
    input     : {
      name         : string[]
      dateOfBirth  : string
      preferredName?: string
      familyNames  : Array<{ name: string; category: string; active?: boolean; order: number }>
    }
  }>): Promise<ServiceResult<{ member: schema.Member; person: schema.Person }>> {
    const memberResult = await MemberService.byAuthUserId({ authUserId: params.authUserId, tx: params.tx })
    if (!memberResult.result) return { status: 404, error: 'Member not found' }

    const member = memberResult.result

    const person = await PersonService.updateProfile({ personId: member.personId, input: params.input, tx: params.tx })
    if (!person) return { status: 404, error: 'Person not found' }

    return { status: 200, result: { member, person } }
  }

  /**
   * Resolves a family (group) for the current member using their primary family name.
   * 
   * TODO: Refactor to throw domain errors instead of returning status codes.
   * Services should not return HTTP status codes (404, 201, 400, 500); routes should handle HTTP responses.
   * 
   * Database Operations (local scope only):
   * - (none) (delegates all family/group writes)
   * 
   * External Calls:
   * - {@link MemberService.byAuthUserId} (lookup)
   * - {@link FamilyService.resolveForMember} (family/group resolution)
   * 
   * @param params - { authUserId, tx }
   * 
   * DB SCOPE:
   * - calls : 0 (local) + delegated
   * - tables: 0 (local)
   * - scope : 
   */
  @withTx
  static async resolveFamilyForAuthUser(params: WithTx<{ authUserId: string }>): Promise<ServiceResult<
    | { kind: 'created'; groupId: string; familyId: string }
    | { kind: 'join_request'; groupId: string; joinRequestId: string }
  >> {
    const memberResult = await MemberService.byAuthUserId({ authUserId: params.authUserId, tx: params.tx })
    if (!memberResult.result) return { status: 404, error: 'Member not found' }

    const member = memberResult.result

    try {
      const result = await FamilyService.resolveForMember({ memberId: member.id, personId: member.personId, tx: params.tx })
      return { status: 201, result }
    } catch (error) {
      if (error instanceof Error && error.message === 'Missing family name') {
        return { status: 400, error: 'Missing family name' }
      }

      return { status: 500, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Fetches a member with their notification preferences.
   * 
   * TODO: Refactor to return data directly instead of ServiceResult with status codes.
   * Services should not return HTTP status codes; routes should handle HTTP responses.
   * 
   * Database Operations (local scope only):
   * - SELECT: members (with left join to notification_preferences)
   * 
   * @param params - { id, tx }
   * @returns Member with preferences or null
   * 
   * DB SCOPE:
   * - calls : 1
   * - tables: 2 (members, notification_preferences)
   * - scope : 
   */
  @withTx
  static async getWithPreferences(params: WithTx<{ id: string }>): Promise<ServiceResult<{ member: schema.Member; preferences: schema.NotificationPreferences | null } | null>> {
    const [result] = await params.tx!
      .select({
        member: schema.members,
        preferences: schema.notificationPreferences,
      })
      .from(schema.members)
      .leftJoin(
        schema.notificationPreferences,
        eq(schema.notificationPreferences.memberId, schema.members.id)
      )
      .where(eq(schema.members.id, params.id))
      .limit(1)

    if (!result) {
      return { status: 200, result: null }
    }

    return {
      status: 200,
      result: {
        member: result.member,
        preferences: result.preferences ?? null,
      },
    }
  }

  /**
   * TODO: Refactor to return data directly instead of ServiceResult with status codes.
   * Services should not return HTTP status codes; routes should handle HTTP responses.
   */
  static async create(data: any): Promise<ServiceResult<any>> {
    void data
    return { status: 501, error: 'Not implemented' }
  }

  /**
   * TODO: Refactor to return data directly instead of ServiceResult with status codes.
   * Services should not return HTTP status codes; routes should handle HTTP responses.
   */
  static async update(id: string, data: any): Promise<ServiceResult<any>> {
    void id
    void data
    return { status: 501, error: 'Not implemented' }
  }

  /**
   * TODO: Refactor to return void or throw errors instead of ServiceResult with status codes.
   * Services should not return HTTP status codes; routes should handle HTTP responses.
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    void id
    return { status: 501, error: 'Not implemented' }
  }
}