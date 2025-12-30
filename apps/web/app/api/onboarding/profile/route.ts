import { z } from 'zod'

import { serverEnv } from '@peeps/config/env'
import { MemberService } from '@peeps/services'

type SupabaseUser = {
  id   : string
  email: string | null
}

const ProfileSchema = z.object({
  name         : z.array(z.string().min(1)),
  dateOfBirth  : z.string().date(),
  preferredName: z.string().optional(),
  familyNames  : z.array(
    z.object({
      name    : z.string().min(1),
      category: z.string().min(1),
      active  : z.boolean().optional(),
      order   : z.number().int().nonnegative(),
    }),
  ),
})

type ProfileInput = z.infer<typeof ProfileSchema>

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

  const json = (await request.json()) as unknown
  let input: ProfileInput

  try {
    input = ProfileSchema.parse(json)
  } catch (error) {
    return new Response(String(error), { status: 400 })
  }

  const result = await MemberService.updateProfile({ authUserId: user.id, input })

  if (!result.result) {
    return new Response(String(result.error ?? 'Failed to update profile'), { status: result.status ?? 500 })
  }

  return Response.json({
    member    : result.result.member,
    person    : result.result.person,
    onboarding: {
      needsProfile: false,
      needsFamily : true,
    },
  })
}
