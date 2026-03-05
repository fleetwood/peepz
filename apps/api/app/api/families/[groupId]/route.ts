import { FamilyService } from '@peeps/services'

export async function GET(_request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const routeParams = await params

  const group = await FamilyService.byGroupId({ groupId: routeParams.groupId })

  if (!group) {
    return new Response(null, { status: 404 })
  }

  return Response.json(group)
}
