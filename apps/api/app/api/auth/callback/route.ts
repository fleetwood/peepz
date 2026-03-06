import { Logger } from '@peeps/utils/logger'
import { serverEnv } from '@peeps/config/env'

const logger = Logger.instance('api/auth/callback', false)

async function exchangeCodeForSession(code: string) {
  const res = await fetch(`${serverEnv.SUPABASE_URL}/auth/v1/exchange?code=${encodeURIComponent(code)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    },
  })

  if (!res.ok) {
    throw new Error(`Supabase exchangeCodeForSession failed: ${res.status} ${res.statusText}`)
  }

  return await res.json()
}

export async function GET(request: Request) {
  logger.debug('GET /api/auth/callback - OAuth callback')
  
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  
  // For OAuth redirects, check if there's an access_token in the hash
  // This happens when Google redirects directly with tokens
  const hashFragment = url.hash.substring(1) // Remove # 
  const hashParams = new URLSearchParams(hashFragment)
  const accessToken = hashParams.get('access_token')
  
  if (accessToken) {
    logger.debug('Found access token in hash fragment, redirecting to Vue app')
    // Redirect to Vue app with the token
    const redirectUrl = new URL(`${serverEnv.APP_URL}/auth/callback`)
    redirectUrl.searchParams.set('access_token', accessToken)
    redirectUrl.searchParams.set('refresh_token', hashParams.get('refresh_token') || '')
    
    return Response.redirect(redirectUrl.toString())
  }
  
  if (error) {
    logger.error('OAuth error', { error, errorDescription })
    return Response.redirect(`${serverEnv.APP_URL}/login?error=${error}&description=${errorDescription}`)
  }
  
  if (!code) {
    logger.error('No code in callback')
    return Response.redirect(`${serverEnv.APP_URL}/login?error=no_code`)
  }
  
  try {
    // Exchange the code for a session
    const data = await exchangeCodeForSession(code)
    
    if (!data.access_token) {
      logger.error('No access token returned')
      return Response.redirect(`${serverEnv.APP_URL}/login?error=no_token`)
    }
    
    logger.debug('Successfully exchanged code for session', { userId: data.user?.id })
    
    // Create a redirect URL with the access token
    const redirectUrl = new URL(`${serverEnv.APP_URL}/auth/callback`)
    redirectUrl.searchParams.set('access_token', data.access_token)
    redirectUrl.searchParams.set('refresh_token', data.refresh_token || '')
    
    return Response.redirect(redirectUrl.toString())
    
  } catch (error) {
    logger.error('Unexpected error in callback', { error })
    return Response.redirect(`${serverEnv.APP_URL}/login?error=unexpected`)
  }
}
