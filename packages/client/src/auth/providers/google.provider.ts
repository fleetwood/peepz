import { AuthProviderId, type AuthProvider, type AuthProviderFactoryDeps } from '@peeps/types'

import { SupabaseClient } from '../../supabase/client'

type GoogleSignInParams = Record<string, never>

type GoogleSendJoinParams = {
  groupId  : string
  sender   : string
  recipient: string
}

export function createGoogleProvider(deps: AuthProviderFactoryDeps): AuthProvider<GoogleSignInParams, GoogleSendJoinParams> {
  const supabase = SupabaseClient.get()

  return {
    id   : AuthProviderId.google,
    label: 'Google',

    async signIn(_params: GoogleSignInParams) {
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
    async sendJoin(params: GoogleSendJoinParams) {
      // we can use QueryManager to send the necessary params to API route
    }
  }
}
