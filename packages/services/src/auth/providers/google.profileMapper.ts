import type { ProviderProfilePatch } from '@peeps/types'

function safeTrim(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function mapGoogleIdentityDataToProfilePatch(identityData: unknown): ProviderProfilePatch {
  const raw = (identityData && typeof identityData === 'object') ? (identityData as Record<string, unknown>) : {}

  const firstName     = safeTrim(raw.given_name)
  const lastName      = safeTrim(raw.family_name)
  const preferredName = safeTrim(raw.given_name) || safeTrim(raw.name)
  const avatarUrl     = safeTrim(raw.picture) || safeTrim(raw.avatar_url)
  const name          = firstName ? [firstName] : []

  return {
    firstName,
    lastName,
    preferredName,
    avatarUrl,
    name,
  }
}
