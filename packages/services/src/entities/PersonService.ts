import { eq } from 'drizzle-orm'
import * as schema from '@peeps/db/schema'
import { type Transaction, type WithTx, withTx } from '@peeps/db/client'
import { z } from 'zod'

export const CreatePersonSchema = z.object({
  name         : z.array(z.string().min(1)),
  dateOfBirth  : z.string().date(),
  preferredName: z.string().optional(),
})

export type CreatePersonInput = z.infer<typeof CreatePersonSchema>

type WithTrx<TParams> = TParams & {
  trx?: Transaction
}

export class PersonService {
  @withTx
  static async list(params: WithTx<WithTrx<Record<string, never>>>) {
    return params.trx!.select().from(schema.persons).limit(20)
  }

  @withTx
  static async byId(params: WithTx<WithTrx<{ id: string }>>) {
    const [person] = await params.trx!
      .select()
      .from(schema.persons)
      .where(eq(schema.persons.id, params.id))
      .limit(1)
    return person
  }

  @withTx
  static async create(params: WithTx<WithTrx<{ input: CreatePersonInput }>>) {
    const [person] = await params.trx!
      .insert(schema.persons)
      .values(params.input)
      .returning()
    return person
  }
}
