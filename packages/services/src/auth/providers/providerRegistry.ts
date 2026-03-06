import type { AuthProviderRegistry, AuthProviderFactoryDeps, AuthProviderId } from '@peeps/types'
import { createEmailProvider } from './email.provider'
import { createGoogleProvider } from './google.provider'

export function createAuthProviderRegistry(deps: AuthProviderFactoryDeps): AuthProviderRegistry {
  const providers = [
    createEmailProvider(deps),
    createGoogleProvider(deps),
  ]

  return {
    get(id: AuthProviderId) {
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
