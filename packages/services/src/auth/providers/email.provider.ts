import { serverEnv } from '@peeps/config/env'
import type { AuthProvider, AuthProviderFactoryDeps } from '@peeps/types'
import { AuthProviderId } from '@peeps/types'

export function createEmailProvider(deps: AuthProviderFactoryDeps): AuthProvider<{ email: string }, never> {
  return {
    id: AuthProviderId.email,
    label: 'Email',
    
    async signIn(params) {
      const res = await fetch(`${serverEnv.SUPABASE_URL}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serverEnv.SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
          email: params.email,
          create_user: true,
          type: 'signup',
          redirect_to: deps.redirectTo,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed to send magic link: ${res.status} ${res.statusText}`)
      }

      return { 
        message: 'Magic link sent to your email',
        email: params.email
      }
    },
    
    async sendJoin() {
      throw new Error('Email provider does not support sendJoin')
    }
  }
}
