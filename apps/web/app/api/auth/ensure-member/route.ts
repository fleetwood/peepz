import { serverEnv } from '@peeps/config/env'
import { MemberService } from '@peeps/services'
import { ApiRoute } from '@/lib/api/ApiRoute'

type SupabaseUser = {
  id   : string
  email: string | null

  identities?: Array<{
    provider: string
    id?     : string
    user_id?: string
    identity_data?: unknown
  }>
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

export async function POST(request: Request) {
  return new ApiRoute(request)
    .auth(true)
    .handle(async (ctx) => {
      const user = await getSupabaseUser(ctx.accessToken)

      return MemberService.validateSupabaseUser({
        authUserId: ctx.authUserId,
        email     : ctx.email,
        user,
      })
    })
}
