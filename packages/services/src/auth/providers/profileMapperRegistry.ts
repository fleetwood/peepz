import type { ProviderProfilePatch } from '@peeps/types'
import { mapGoogleIdentityDataToProfilePatch } from './google.profileMapper'

export function getProviderProfilePatch(params: { provider: string; identityData: unknown }): ProviderProfilePatch {
  if (params.provider === 'google') return mapGoogleIdentityDataToProfilePatch(params.identityData)

  return {}
}
