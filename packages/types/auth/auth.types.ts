import type { AuthProviderId } from './authProvider.types'
import type { UserDto } from '../user/user.dto'
import { z } from 'zod'
import { UserStatusEnum } from '@peeps/types';

export type ContinueAfterAuthResult<TEnsureMemberResponse> =
  | { kind: 'ok'; data: TEnsureMemberResponse }
  | { kind: 'link_required'; provider: string | null }

export type EnsureAuthIdentity = {
  provider      : string
  providerUserId: string
  email?        : string | null
  rawProfile?   : unknown
}

export type ProviderProfilePatch = {
  firstName?    : string
  lastName?     : string
  preferredName?: string
  avatarUrl?    : string
  name?         : string[]
}

export type SignInParams = {
  provider: AuthProviderId
  params?: Record<string, any>
}

export const SignInBodySchema = z.object({
  provider: z.enum(['google', 'email']),
  params: z.record(z.any()).optional(),
  redirectTo: z.string().optional(),
})

export type SignInBody = z.infer<typeof SignInBodySchema>

export type AuthResponse = {
  user?: UserDto
  url?: string
  message?: string
  accessToken?: string
  refreshToken?: string
}

export type UserStatus = typeof UserStatusEnum[keyof typeof UserStatusEnum]
