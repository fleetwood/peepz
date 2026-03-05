import { clientEnv, serverEnv } from '@peeps/config/env'
import { IdentitiesService, MemberService, ResendService } from '@peeps/services'
import { ApiRoute } from '@/lib/api/ApiRoute'

type SupabaseUser = {
  identities?: Array<{
    provider: string
    id?     : string
    user_id?: string
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

type StartLinkBody = {
  provider: string
}

export async function POST(request: Request) {
  return new ApiRoute(request)
    .auth(true)
    .handle(async (ctx) => {
      const body = (await request.json()) as StartLinkBody
      const provider = typeof body.provider === 'string' ? body.provider : ''
      if (!provider) {
        throw {
          error     : 'Missing provider',
          code      : 'API_BAD_REQUEST',
          statusCode: 400,
        }
      }

      const memberResult = await MemberService.byEmail({ email: ctx.email })
      if (!memberResult.result) {
        throw {
          error     : 'No existing member for email',
          code      : 'API_NOT_FOUND',
          statusCode: 404,
        }
      }

      const user = await getSupabaseUser(ctx.accessToken)
      const identities = user.identities ?? []
      const match = identities.find((i) => i.provider === provider)

      const providerUserId = match?.id ?? match?.user_id ?? ''
      if (!providerUserId) {
        throw {
          error      : 'Provider identity not present on current session',
          code       : 'AUTH_IDENTITY_LINK_REQUIRED',
          statusCode : 409,
          errorDetails: { provider },
        }
      }

      const created = await IdentitiesService.startAuthIdentityLink({
        memberId      : memberResult.result.id,
        provider,
        providerUserId,
        providerEmail : ctx.email,
      })

      if (!created.result) {
        throw {
          error     : created.error ?? 'Failed to start link request',
          code      : 'SYS_INTERNAL_ERROR',
          statusCode: created.status ?? 500,
        }
      }

      const confirmUrl = `${clientEnv.APP_URL}/api/auth/link-identity/confirm?token=${created.result.token}`

      const sent = await ResendService.sendEmail({
        to     : ctx.email,
        subject: 'Confirm linking your login provider',
        html   : `<p>Click to confirm linking your login:</p><p><a href="${confirmUrl}">Confirm link</a></p>`,
      })

      if (!sent.result) {
        throw {
          error     : sent.error ?? 'Failed to send confirmation email',
          code      : 'SYS_INTERNAL_ERROR',
          statusCode: sent.status ?? 500,
        }
      }

      return { ok: true }
    })
}
