import { AuthProviderId, type AuthProvider, type AuthProviderFactoryDeps } from '@peeps/types'

import { SupabaseClient } from '../../supabase/client'

type EmailOtpSignInParams = {
  email: string
}

type EmailSendJoinParams = {
  groupId: string
  sender : string
  email  : string
}

export function createEmailOtpProvider(deps: AuthProviderFactoryDeps): AuthProvider<EmailOtpSignInParams, EmailSendJoinParams> {
  const supabase = SupabaseClient.get()

  return {
    id   : AuthProviderId.email,
    label: 'Email',

    async signIn(params: EmailOtpSignInParams) {
      const trimmed = params.email.trim()
      if (!trimmed) {
        throw new Error('Enter an email')
      }

      const { error } = await supabase.auth.signInWithOtp({
        email  : trimmed,
        options: {
          emailRedirectTo: deps.redirectTo,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      return 'Check your email for a login link.'
    },
    async sendJoin(params: EmailSendJoinParams) {
      // we can use QueryManager to send the necessary params to API route
    }
  }
}
