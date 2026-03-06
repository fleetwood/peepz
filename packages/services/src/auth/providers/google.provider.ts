import { serverEnv } from '@peeps/config/env'
import type { AuthProvider, AuthProviderFactoryDeps } from '@peeps/types'
import { AuthProviderId } from '@peeps/types'

export function createGoogleProvider(deps: AuthProviderFactoryDeps): AuthProvider<{ email?: string }, never> {
  return {
    id: AuthProviderId.google,
    label: 'Google',
    
    async signIn() {
      const authUrl = `${serverEnv.SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(deps.redirectTo)}&scopes=email%20profile`
      
      console.log('Google OAuth URL:', authUrl)
      console.log('Redirect to:', deps.redirectTo)
      
      return { 
        url: authUrl,
        message: 'Visit this URL to sign in with Google'
      }
    },
    
    async sendJoin() {
      throw new Error('Google provider does not support sendJoin')
    }
  }
}
