import { and, asc, eq, ilike, sql } from 'drizzle-orm'

import * as schema from '@peeps/db/schema'
import { type Transaction, type WithTx, withTx } from '@peeps/db/client'
import { type PaginatedResponse, type PaginationParams } from '@peeps/types/response/paginated.response'

type WithTrx<TParams> = TParams & {
  trx?: Transaction
}

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
  @withTx
  static async list(params: WithTx<WithTrx<ListFamiliesParams>>): Promise<PaginatedResponse<{ families: schema.Family; groups: schema.Group }>> {
    const { page, limit } = params.pagination
    const offset = params.pagination.offset ?? (page - 1) * limit

    const [totalRow] = await params.trx!
      .select({ count: sql<number>`count(*)` })
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(eq(schema.groups.type, 'FAMILY'))

    const total = Number(totalRow?.count ?? 0)

    const data = await params.trx!
      .select()
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(eq(schema.groups.type, 'FAMILY'))
      .orderBy(asc(schema.groups.name))
      .limit(limit)
      .offset(offset)

    return {
      data,
      page,
      limit,
      total,
      hasMore: offset + data.length < total,
    }
  }

  @withTx
  static async search(params: WithTx<WithTrx<SearchFamiliesParams>>): Promise<PaginatedResponse<{ families: schema.Family; groups: schema.Group }>> {
    const query = params.query.trim()
    const { page, limit } = params.pagination
    const offset = params.pagination.offset ?? (page - 1) * limit

    const where = query.length > 0
      ? and(eq(schema.groups.type, 'FAMILY'), ilike(schema.groups.name, `%${query}%`))
      : eq(schema.groups.type, 'FAMILY')

    const [totalRow] = await params.trx!
      .select({ count: sql<number>`count(*)` })
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(where)

    const total = Number(totalRow?.count ?? 0)

    const data = await params.trx!
      .select()
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(where)
      .orderBy(asc(schema.groups.name))
      .limit(limit)
      .offset(offset)

    return {
      data,
      page,
      limit,
      total,
      hasMore: offset + data.length < total,
    }
  }

  @withTx
  static async byGroupId(
    params: WithTx<WithTrx<FamilyByGroupIdParams>>,
  ): Promise<{ families: schema.Family; groups: schema.Group } | undefined> {
    const [row] = await params.trx!
      .select()
      .from(schema.groups)
      .innerJoin(schema.families, eq(schema.families.groupId, schema.groups.id))
      .where(and(
        eq(schema.groups.id, params.groupId),
        eq(schema.groups.type, 'FAMILY'),
      ))
      .limit(1)

    return row
  }
}
