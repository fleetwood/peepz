import { serverEnv } from '@peeps/config/env'
import { MemberService } from '@peeps/services'

type SupabaseUser = {
  id   : string
  email: string | null
}

async function getSupabaseUser(accessToken: string): Promise<SupabaseUser> {
  const res = await fetch(`${serverEnv.SUPABASE_URL}/auth/v1/user`, {
    method : 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey       : serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    },
  })

  if (!res.ok) {
    throw new Error(`Supabase getUser failed: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as SupabaseUser
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null

  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null

  return token
}

export async function POST(request: Request) {
  const accessToken = getBearerToken(request)
  if (!accessToken) {
    return new Response('Missing bearer token', { status: 401 })
  }

  let user: SupabaseUser

  try {
    user = await getSupabaseUser(accessToken)
  } catch (error) {
    return new Response(String(error), { status: 401 })
  }

  if (!user.email) {
    return new Response('Supabase user missing email', { status: 400 })
  }

  const result = await MemberService.resolveFamilyForAuthUser({ authUserId: user.id })

  if (!result.result) {
    return new Response(String(result.error ?? 'Failed to resolve family'), { status: result.status ?? 500 })
  }

  if (result.result.kind === 'created') {
    return Response.json({
      family: {
        groupId : result.result.groupId,
        familyId: result.result.familyId,
        created : true,
      },
      onboarding: {
        needsProfile: false,
        needsFamily : false,
      },
    })
  }

  return Response.json({
    family: {
      groupId      : result.result.groupId,
      joinRequestId: result.result.joinRequestId,
      created      : false,
    },
    onboarding: {
      needsProfile : false,
      needsFamily  : false,
      needsApproval: true,
    },
  })
}
