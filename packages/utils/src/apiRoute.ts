import { createRemoteJWKSet, jwtVerify } from 'jose'
import {
  ErrorCodeEnum,
  errorCodeToMessage,
  errorCodeToStatusCode,
  type ApiErrorShape,
  type ServiceResult,
  type TokenVerifier,
  type TokenVerifierResult,
} from '@peeps/types'

/**
 * Builds a TokenVerifier that validates Supabase JWTs against the project's JWKS.
 *
 * - Downloads JWKS from `${supabaseUrl}/auth/v1/.well-known/jwks.json` and caches it via jose
 * - Verifies `audience: authenticated` and `issuer: ${supabaseUrl}/auth/v1`
 * - Extracts `sub` (authUserId) and `email` claims; throws if `sub` is missing
 *
 * @param supabaseUrl - Base Supabase project URL (e.g., https://abc.supabase.co)
 * @returns TokenVerifier that resolves `{ authUserId, email }`
 */
export function createSupabaseVerifier(supabaseUrl: string): TokenVerifier {
  const jwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`))
  const issuer = `${supabaseUrl}/auth/v1`

  return async (accessToken: string): Promise<TokenVerifierResult> => {
    const { payload } = await jwtVerify(accessToken, jwks, { issuer, audience: 'authenticated' })

    const authUserId = typeof payload.sub === 'string' ? payload.sub : ''
    const email      = typeof payload.email === 'string' ? payload.email : null

    if (!authUserId) {
      throw new Error('Invalid access token: missing sub claim')
    }

    return { authUserId, email }
  }
}

/**
 * Normalizes any thrown value into the API error shape consumed by ApiRoute/ExApiRoute.
 *
 * Supports:
 * - Already-shaped ApiError-like objects (error/code/statusCode)
 * - string messages
 * - Error instances (preserves name in errorDetails)
 * - fallback: internal error with generic message
 */
export function normalizeError(error: unknown): ApiErrorShape {
  if (error && typeof error === 'object' && 'statusCode' in error && 'code' in error && 'error' in error) {
    const e = error as Partial<ApiErrorShape>
    if (typeof e.error === 'string' && typeof e.statusCode === 'number' && typeof e.code === 'string') {
      return {
        error       : e.error,
        code        : e.code,
        statusCode  : e.statusCode,
        statusText  : e.statusText,
        errorDetails: e.errorDetails,
      }
    }
  }

  if (typeof error === 'string') {
    return {
      error     : error,
      code      : ErrorCodeEnum.SYS_INTERNAL_ERROR,
      statusCode: errorCodeToStatusCode[ErrorCodeEnum.SYS_INTERNAL_ERROR],
    }
  }

  if (error instanceof Error) {
    return {
      error       : error.message,
      code        : ErrorCodeEnum.SYS_INTERNAL_ERROR,
      statusCode  : errorCodeToStatusCode[ErrorCodeEnum.SYS_INTERNAL_ERROR],
      errorDetails: { name: error.name },
    }
  }

  return {
    error     : errorCodeToMessage[ErrorCodeEnum.SYS_INTERNAL_ERROR],
    code      : ErrorCodeEnum.SYS_INTERNAL_ERROR,
    statusCode: errorCodeToStatusCode[ErrorCodeEnum.SYS_INTERNAL_ERROR],
  }
}

/**
 * Type guard for the `ServiceResult` shape (`{ status, result | error }`).
 */
export function isServiceResult(value: unknown): value is ServiceResult {
  if (!value || typeof value !== 'object') return false
  return 'status' in value && ('result' in value || 'error' in value)
}
