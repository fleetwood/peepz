import { ApiRoute } from '@/lib/api/ApiRoute'
import { AuthService } from '@peeps/services'
import { Logger } from '@peeps/utils/logger'
import { handleOptions as OPTIONS } from '@/lib/api/cors'

const logger = Logger.instance('api/auth/signout', false)

export { OPTIONS }

export async function POST(request: Request) {
  logger.info('POST /api/auth/signout', {
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url
  })
  return new ApiRoute(request)
    .auth(true)
    .handle(async ({ accessToken }) => {
      logger.info('Signing out', { accessToken })
      return await AuthService.signOut()
    })
}
