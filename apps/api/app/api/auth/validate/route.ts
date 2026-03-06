import { Logger } from '@peeps/utils/logger'
import { serverEnv } from '@peeps/config/env'
import { UserService } from '@peeps/services'
import { handleOptions as OPTIONS } from '@/lib/api/cors'
import { ApiRoute } from '@/lib/api/ApiRoute'
import { z } from 'zod'
import { ValidationSourceEnum } from '@peeps/types'

const logger = Logger.instance('api/auth/validate')

export { OPTIONS }

const ValidateBodySchema = z.object({
  accessToken: z.string(),
})

async function validateToken(accessToken: string) {
  const res = await fetch(`${serverEnv.SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    },
  })

  if (!res.ok) {
    throw new Error(`Supabase getUser failed: ${res.status} ${res.statusText}`)
  }

  return await res.json()
}

export async function POST(request: Request) {
  logger.debug('POST /api/auth/validate - token validation')
  
  return new ApiRoute(request)
    .validate(ValidationSourceEnum.BODY, ValidateBodySchema)
    .handle(async ({ validatedData }) => {
      const { accessToken } = validatedData![ValidationSourceEnum.BODY] as { accessToken: string }
      
      logger.debug('Validating access token')
      const supabaseUser = await validateToken(accessToken)
      logger.debug('Token validated successfully', { userId: supabaseUser.id })
      
      // Get full UserDto using UserService (same as /api/me)
      const user = await UserService.byAuthUserId({ 
        authUserId: supabaseUser.id, 
        email: supabaseUser.email 
      })
      
      return user
    })
}
