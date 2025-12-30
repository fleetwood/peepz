import { and, eq } from 'drizzle-orm'
import * as schema from '@peeps/db/schema'
import { type Transaction, type WithTx, withTx } from '@peeps/db/client'
import { type ServiceResult } from '@peeps/types/response/response.types'

type WithTrx<TParams> = TParams & {
  trx?: Transaction
}

export class MemberService {
  @withTx
  static async getById(params: WithTx<WithTrx<{ id: string }>>): Promise<ServiceResult<schema.Member | null>> {
    const [member] = await params.trx!.select().from(schema.members).where(eq(schema.members.id, params.id)).limit(1)
    return { status: 200, result: member ?? null }
  }

  @withTx
  static async byAuthUserId(params: WithTx<WithTrx<{ authUserId: string }>>): Promise<ServiceResult<schema.Member | null>> {
    const [member] = await params.trx!
      .select()
      .from(schema.members)
      .where(eq(schema.members.authUserId, params.authUserId))
      .limit(1)
    return { status: 200, result: member ?? null }
  }

  @withTx
  static async ensureForAuthUser(params: WithTx<WithTrx<{ authUserId: string; email: string }>>): Promise<ServiceResult<schema.Member>> {
    const existing = await MemberService.byAuthUserId({ authUserId: params.authUserId, tx: params.trx })
    if (existing.result) return { status: 200, result: existing.result }

    const [person] = await params.trx!
      .insert(schema.persons)
      .values({ name: [params.email], dateOfBirth: '1970-01-01' })
      .returning()

    const [member] = await params.trx!
      .insert(schema.members)
      .values({ authUserId: params.authUserId, email: params.email, personId: person.id })
      .returning()

    return { status: 201, result: member }
  }

  @withTx
  static async updateProfile(params: WithTx<WithTrx<{
    authUserId: string
    input     : {
      name         : string[]
      dateOfBirth  : string
      preferredName?: string
      familyNames  : Array<{ name: string; category: string; active?: boolean; order: number }>
    }
  }>>): Promise<ServiceResult<{ member: schema.Member; person: schema.Person }>> {
    const memberResult = await MemberService.byAuthUserId({ authUserId: params.authUserId, tx: params.trx })
    if (!memberResult.result) return { status: 404, error: 'Member not found' }

    const member = memberResult.result

    const [person] = await params.trx!
      .update(schema.persons)
      .set({
        name         : params.input.name,
        dateOfBirth  : params.input.dateOfBirth,
        preferredName: params.input.preferredName,
      })
      .where(eq(schema.persons.id, member.personId))
      .returning()

    await params.trx!.delete(schema.personFamilyNames).where(eq(schema.personFamilyNames.personId, member.personId))

    if (params.input.familyNames.length > 0) {
      await params.trx!.insert(schema.personFamilyNames).values(
        params.input.familyNames.map((f) => ({
          personId : member.personId,
          name     : f.name,
          category : f.category as any,
          active   : f.active ?? true,
          order    : f.order,
        })),
      )
    }

    return { status: 200, result: { member, person } }
  }

  @withTx
  static async resolveFamilyForAuthUser(params: WithTx<WithTrx<{ authUserId: string }>>): Promise<ServiceResult<
    | { kind: 'created'; groupId: string; familyId: string }
    | { kind: 'join_request'; groupId: string; joinRequestId: string }
  >> {
    const memberResult = await MemberService.byAuthUserId({ authUserId: params.authUserId, tx: params.trx })
    if (!memberResult.result) return { status: 404, error: 'Member not found' }

    const member = memberResult.result

    const [primaryFamilyName] = await params.trx!
      .select()
      .from(schema.personFamilyNames)
      .where(and(
        eq(schema.personFamilyNames.personId, member.personId),
        eq(schema.personFamilyNames.active, true),
      ))
      .orderBy(schema.personFamilyNames.order)
      .limit(1)

    if (!primaryFamilyName) return { status: 400, error: 'Missing family name' }

    const [existingGroup] = await params.trx!
      .select()
      .from(schema.groups)
      .where(and(
        eq(schema.groups.type, 'FAMILY'),
        eq(schema.groups.name, primaryFamilyName.name),
      ))
      .limit(1)

    if (!existingGroup) {
      const [group] = await params.trx!
        .insert(schema.groups)
        .values({
          name             : primaryFamilyName.name,
          type             : 'FAMILY',
          createdByMemberId: member.id,
          governanceModel  : 'SINGLE_ADMIN',
          removalPolicy    : 'IMMEDIATE',
        })
        .returning()

      const [family] = await params.trx!
        .insert(schema.families)
        .values({ groupId: group.id })
        .returning()

      await params.trx!.insert(schema.groupMemberships).values({ groupId: group.id, personId: member.personId, role: 'ADMIN', status: 'ACTIVE' })

      return { status: 201, result: { kind: 'created', groupId: group.id, familyId: family.id } }
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

    const [joinRequest] = await params.trx!
      .insert(schema.familyJoinRequests)
      .values({ memberId: member.id, groupId: existingGroup.id, expiresAt })
      .returning()

    return { status: 201, result: { kind: 'join_request', groupId: existingGroup.id, joinRequestId: joinRequest.id } }
  }

  static async create(data: any): Promise<ServiceResult<any>> {
    void data
    return { status: 501, error: 'Not implemented' }
  }

  static async update(id: string, data: any): Promise<ServiceResult<any>> {
    void id
    void data
    return { status: 501, error: 'Not implemented' }
  }

  static async delete(id: string): Promise<ServiceResult<void>> {
    void id
    return { status: 501, error: 'Not implemented' }
  }
}