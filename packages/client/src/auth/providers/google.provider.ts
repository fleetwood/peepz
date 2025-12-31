import { AuthProviderId, type AuthProvider, type AuthProviderFactoryDeps } from '@peeps/types'

import { SupabaseClient } from '../../supabase/client'

type GoogleSignInParams = Record<string, never>

export function createGoogleProvider(deps: AuthProviderFactoryDeps): AuthProvider<GoogleSignInParams> {
  const supabase = SupabaseClient.get()

  return {
    id   : AuthProviderId.google,
    label: 'Google',

    async signIn() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options : {
          redirectTo: deps.redirectTo,
        },
      })

      if (error) {
        throw new Error(error.message)
      }
    },
  }
}
