import { and, eq } from 'drizzle-orm'
import * as schema from '@peeps/db/schema'
import { type WithTx, withTx } from '@peeps/db/client'
import { z } from 'zod'

import { FamilyNameCategory } from '@peeps/db/schema/enums'

import type { ProviderProfilePatch } from '@peeps/types'

export const CreatePersonSchema = z.object({
  name         : z.array(z.string().min(1)),
  dateOfBirth  : z.string().date(),
  preferredName: z.string().optional(),
})

type CreatePersonInput = z.infer<typeof CreatePersonSchema>

export class PersonService {
  @withTx
  static async list(params: WithTx<Record<string, never>>) {
    return params.tx!.select().from(schema.persons).limit(20)
  }

  @withTx
  static async byId(params: WithTx<{ id: string }>) {
    const [person] = await params.tx!
      .select()
      .from(schema.persons)
      .where(eq(schema.persons.id, params.id))
      .limit(1)
    return person
  }

  @withTx
  static async create(params: WithTx<{ input: CreatePersonInput }>) {
    const [person] = await params.tx!
      .insert(schema.persons)
      .values(params.input)
      .returning()
    return person
  }

  @withTx
  static async createFromEmail(params: WithTx<{ email: string }>) {
    const [person] = await params.tx!
      .insert(schema.persons)
      .values({
        name: [params.email],
      })
      .returning()

    return person
  }

  @withTx
  static async updateProfile(params: WithTx<{
    personId: string
    input   : {
      name         : string[]
      dateOfBirth  : string
      preferredName?: string
      familyNames  : Array<{ name: string; category: string; active?: boolean; order: number }>
    }
  }>) {
    const [person] = await params.tx!
      .update(schema.persons)
      .set({
        name         : params.input.name,
        dateOfBirth  : params.input.dateOfBirth,
        preferredName: params.input.preferredName,
      })
      .where(eq(schema.persons.id, params.personId))
      .returning()

    if (!person) return null

    await params.tx!.delete(schema.personFamilyNames).where(eq(schema.personFamilyNames.personId, params.personId))

    if (params.input.familyNames.length > 0) {
      await params.tx!.insert(schema.personFamilyNames).values(
        params.input.familyNames.map((f) => ({
          personId : params.personId,
          name     : f.name,
          category : f.category as any,
          active   : f.active ?? true,
          order    : f.order,
        })),
      )
    }

    return person
  }

  @withTx
  static async applyBestEffortProfilePatch(params: WithTx<{ personId: string; patch: ProviderProfilePatch }>) {
    const [person] = await params.tx!
      .select()
      .from(schema.persons)
      .where(eq(schema.persons.id, params.personId))
      .limit(1)

    if (!person) return null

    const shouldUpdate = (!person.firstName && params.patch.firstName)
      || (!person.lastName && params.patch.lastName)
      || (!person.preferredName && params.patch.preferredName)
      || (!person.avatarUrl && params.patch.avatarUrl)
      || (person.name.length === 0 && params.patch.name && params.patch.name.length > 0)

    if (shouldUpdate) {
      await params.tx!
        .update(schema.persons)
        .set({
          firstName    : person.firstName ?? params.patch.firstName,
          lastName     : person.lastName ?? params.patch.lastName,
          preferredName: person.preferredName ?? params.patch.preferredName,
          avatarUrl    : person.avatarUrl ?? params.patch.avatarUrl,
          name         : person.name.length > 0 ? person.name : (params.patch.name ?? person.name),
        })
        .where(eq(schema.persons.id, params.personId))
    }

    if (!person.lastName && params.patch.lastName) {
      const [existingFamilyName] = await params.tx!
        .select()
        .from(schema.personFamilyNames)
        .where(and(
          eq(schema.personFamilyNames.personId, params.personId),
          eq(schema.personFamilyNames.order, 0),
        ))
        .limit(1)

      if (!existingFamilyName) {
        await params.tx!.insert(schema.personFamilyNames).values({
          personId : params.personId,
          name     : params.patch.lastName,
          category : FamilyNameCategory.other,
          active   : true,
          order    : 0,
        })
      }
    }

    return person
  }
}
