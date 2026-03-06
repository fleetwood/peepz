import { ErrorCodeEnum } from '../base/errorCodes'
import type { ChainContext } from './response.types'

/**
 * Standardized error shape returned by ApiRoute/ExApiRoute JSON error responses.
 */
export type ApiErrorShape = {
  error        : string
  code         : ErrorCodeEnum | string
  statusCode   : number
  statusText?  : string
  errorDetails?: Record<string, unknown>
}

/**
 * Context shape for authenticated handlers: accessToken, authUserId, and email
 * are guaranteed to be non-nullable strings.
 */
export type AuthedChainContext = Omit<ChainContext, 'accessToken' | 'authUserId' | 'email'> & {
  accessToken: string
  authUserId : string
  email      : string
}

/**
 * Result and function type for pluggable token verifiers (e.g., Supabase JWT, Clerk, API keys).
 */
export type TokenVerifierResult = { authUserId: string; email: string | null }
export type TokenVerifier = (token: string) => Promise<TokenVerifierResult>
