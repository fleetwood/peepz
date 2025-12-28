import { FamilyService } from '@peeps/services'

function parsePagination(url: URL) {
  const pageParam  = url.searchParams.get('page')
  const limitParam = url.searchParams.get('limit')

  const page  = Math.max(1, Number(pageParam ?? 1))
  const limit = Math.max(1, Number(limitParam ?? 20))

  return { page, limit }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pagination = parsePagination(url)

  const result = await FamilyService.list({ pagination })
  return Response.json(result)
}
