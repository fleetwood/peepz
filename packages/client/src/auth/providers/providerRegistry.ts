import { type AuthProviderRegistry, type AuthProviderFactoryDeps } from '@peeps/types'

import { createEmailOtpProvider } from './emailOtp.provider'
import { createGoogleProvider } from './google.provider'

export function createAuthProviderRegistry(deps: AuthProviderFactoryDeps): AuthProviderRegistry {
  const providers = [
    createEmailOtpProvider(deps),
    createGoogleProvider(deps),
  ]

  return {
    get(id) {
      const found = providers.find((p) => p.id === id)
      if (!found) {
        throw new Error(`Unknown auth provider: ${id}`)
      }

      return found
    },
    list() {
      return providers
    },
  }
}
