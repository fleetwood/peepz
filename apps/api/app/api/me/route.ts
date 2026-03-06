import { ApiRoute } from '@/lib/api/ApiRoute'
import { UserService } from '@peeps/services'
import { Logger } from '@peeps/utils'
import { handleOptions as OPTIONS } from '@/lib/api/cors'

const logger = Logger.instance('api/me', false)

export { OPTIONS }

export async function GET(request: Request) {
  logger.info('GET /api/me')
  return new ApiRoute(request)
    .auth() // Optional auth
    .handle(async ({ authUserId, email }) =>{
      if (!authUserId || !email) {
        logger.debug('No authenticated user')
        return null
      }
      
      logger.info('Fetching user', { authUserId, email })
      const userResult = await UserService.byAuthUserId({ authUserId, email })
      logger.debug('User fetched', { user: userResult.result })
      return userResult.result
    })
}
