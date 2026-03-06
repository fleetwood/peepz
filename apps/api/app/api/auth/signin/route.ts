import { Logger } from '@peeps/utils/logger'
import { AuthService } from '@peeps/services'
import { SignInBodySchema, ValidationSourceEnum } from '@peeps/types'
import { serverEnv } from '@peeps/config/env'
import { handleOptions as OPTIONS } from '@/lib/api/cors'
import { ApiRoute } from '@/lib/api/ApiRoute'

const logger = Logger.instance('api/auth/signin')

export { OPTIONS }

export async function POST(request: Request) {
  logger.debug('POST /api/auth/signin - received request')
  
  return new ApiRoute(request)
    .validate(ValidationSourceEnum.BODY, SignInBodySchema)
    .handle(async ({ validatedData }) => {
      const body = validatedData![ValidationSourceEnum.BODY] as { provider: 'google' | 'email', params?: Record<string, any> }
      logger.debug('Validated body', { body })
      
      // Build the Vue app callback URL for OAuth
      const callbackUrl = `${serverEnv.APP_URL}/auth/callback`
      logger.debug('Using callback URL', { callbackUrl })
      
      // Call AuthService to handle the signin
      const result = await AuthService.signIn({
        ...body,
        redirectTo: callbackUrl
      })
      logger.debug('AuthService result', { result })
      
      return result
    })
}
