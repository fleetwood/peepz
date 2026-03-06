import type { SignInBody } from '@peeps/types'
import { createAuthProviderRegistry } from './providers/providerRegistry'

export class AuthService {
  static async signIn(body: SignInBody) {
    const { provider, params, redirectTo } = body
    
    const providerRegistry = createAuthProviderRegistry({
      redirectTo: redirectTo || 'http://localhost:3000/auth/callback'
    })
    
    const authProvider = providerRegistry.get(provider)
    
    if (provider === 'email') {
      const email = params?.email
      if (!email || typeof email !== 'string') {
        throw new Error('Email is required for email provider')
      }
      return await authProvider.signIn({ email })
    }
    
    return await authProvider.signIn(params || {})
  }

  static async signOut() {
    // In a proper implementation, this would:
    // 1. Clear the session cookie/token
    // 2. Invalidate the session on the server
    // 3. Return success response
    
    // For now, just return success - the client will clear its state
    return { 
      message: 'Signed out successfully'
    }
  }
}