import { clientEnv } from '@peeps/config/env'
import { IdentitiesService } from '@peeps/services'
import { ApiRoute } from '@/lib/api/ApiRoute'

export async function GET(request: Request) {
  return new ApiRoute(request)
    .handle(async () => {
      const url = new URL(request.url)
      const token = url.searchParams.get('token') ?? ''

      if (!token) {
        throw {
          error     : 'Missing token',
          code      : 'API_BAD_REQUEST',
          statusCode: 400,
        }
      }

      const confirmed = await IdentitiesService.confirmAuthIdentityLink({ token })
      if (!confirmed.result) {
        throw {
          error     : confirmed.error ?? 'Failed to confirm link',
          code      : 'SYS_INTERNAL_ERROR',
          statusCode: confirmed.status ?? 500,
        }
      }

      const redirectUrl = new URL('/profile?linked=1', clientEnv.APP_URL)
      return Response.redirect(redirectUrl.toString(), 302)
    })
}
