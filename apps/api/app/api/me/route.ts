import { ApiRoute } from '@/lib/api/ApiRoute'
import { UserService } from '@peeps/services'
import { Logger } from '@peeps/utils'
import { handleOptions as OPTIONS } from '@/lib/api/cors'

const logger = Logger.instance('api/me')

export { OPTIONS }

export async function GET(request: Request) {
  logger.info('GET /api/me')
  return new ApiRoute(request)
    .auth(true)
    .handle(async ({ authUserId, email }) =>{
      logger.info('Fetching user', { authUserId, email })
      const user = await UserService.byAuthUserId({ authUserId, email })
      logger.debug('User fetched', { user })
      return user
    })
}
