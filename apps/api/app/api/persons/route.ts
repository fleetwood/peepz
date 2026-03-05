import { CreatePersonSchema, PersonService } from '@peeps/services'

export async function GET() {
  const persons = await PersonService.list({})
  return Response.json(persons)
}

export async function POST(request: Request) {
  const json = await request.json()
  const input = CreatePersonSchema.parse(json)

  const person = await PersonService.create({ input })
  return Response.json(person)
}
