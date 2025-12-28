import { eq } from 'drizzle-orm'

import * as schema from '@peeps/db/schema'
import { type Transaction, type WithTx, withTx } from '@peeps/db/client'
import type { UserDto } from '@peeps/types/user/user.dto'
import { type ServiceResult } from '@peeps/types/response/response.types'

type WithTrx<TParams> = TParams & {
  trx?: Transaction
}

type ByAuthUserIdParams = {
  authUserId: string
  email     : string
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
  static async byAuthUserId(params: WithTx<WithTrx<ByAuthUserIdParams>>): Promise<ServiceResult<UserDto | null>> {
    const [row] = await params.trx!
      .select({
        member: schema.members,
        person: schema.persons,
      })
      .from(schema.members)
      .innerJoin(schema.persons, eq(schema.persons.id, schema.members.personId))
      .where(eq(schema.members.authUserId, params.authUserId))
      .limit(1)

    if (!row) return { status: 404, result: null }

    return {
      status: 200,
      result: {
        member: {
          id          : row.member.id,
          personId    : row.member.personId,
          authUserId  : row.member.authUserId,
          email       : row.member.email,
          privacyLevel: row.member.privacyLevel as UserDto['member']['privacyLevel'],
          createdAt   : toIsoDate(row.member.createdAt),
          updatedAt   : toIsoDate(row.member.updatedAt),
          visible     : row.member.visible,
        },
        person: {
          id           : row.person.id,
          name         : row.person.name,
          dateOfBirth  : toIsoDay(row.person.dateOfBirth),
          preferredName: row.person.preferredName ?? null,
          createdAt    : toIsoDate(row.person.createdAt),
          updatedAt    : toIsoDate(row.person.updatedAt),
          visible      : row.person.visible,
        },
        auth: {
          authUserId: params.authUserId,
          email     : params.email,
        },
      },
    }
  }
}
