import { PersonService } from '@peeps/services'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const routeParams = await params
  const person = await PersonService.byId({ id: routeParams.id })

  if (!person) {
    return new Response(null, { status: 404 })
  }

  return Response.json(person)
}

export async function PUT() {
  return new Response('Not implemented', { status: 501 })
}

export async function DELETE() {
  return new Response('Not implemented', { status: 501 })
}
