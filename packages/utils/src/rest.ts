import { ErrorCodeEnum } from '@peeps/types/base/errorCodes'
import { PEEPS_API_KEY_HEADER } from '@peeps/config/constants/queryManager'

import { Logger } from './logger'

type RestAuthConfig = {
  apiKey         : string
  getAccessToken?: () => Promise<string | null>
}

let defaultAuthConfig: RestAuthConfig | null = null

export function setRestAuthConfig(config: {
  apiKey         : string
  getAccessToken?: () => Promise<string | null>
}) {
  defaultAuthConfig = config
}

export function clearRestAuthConfig() {
  defaultAuthConfig = null
}

/**
 * Standard response type for all API hook utilities
 * @template T - The expected data type
 */
type HookResponse<T> = {
  /** The response data (extracted from response.data if present, otherwise the full response) */
  data?: T
  /** Error message if the request failed */
  error?: string
  /** HTTP status code */
  status?: number
  /** HTTP status text */
  statusText?: string
  /** Application-specific error code */
  code?: ErrorCodeEnum | string
  /** Additional error details */
  errorDetails?: Record<string, any>
}

function toHookResponse<T>(value: HookResponse<T>) {
  return value
}

/**
 * Handles API response parsing and error extraction
 * @template T - The expected data type
 * @param response - The fetch Response object
 * @param errorMessage - Optional custom error message
 * @returns Promise<HookResponse<T>> - Standardized response object
 * @internal
 */
export async function handleHookResponse<T>(
  response: Response,
  errorMessage?: string
): Promise<{
  data?        : T
  error?       : string
  status?      : number
  statusText?  : string
  code?        : ErrorCodeEnum | string
  errorDetails?: Record<string, any>
}> {
  const logger = Logger.instance('handleHookResponse', false)
  let result: any
  
  try {
    result = await response.json()
  } catch (parseError) {
    logger.error('Failed to parse response as JSON', {
      parseError,
      contentType: response.headers.get('content-type'),
    })
    return toHookResponse({
      error: `Failed to parse response: ${response.statusText || 'Invalid JSON response'}`,
      status: response.status,
      statusText: response.statusText,
      code: ErrorCodeEnum.API_INTERNAL_ERROR,
      errorDetails: {
        parseError: parseError instanceof Error ? parseError.message : String(parseError),
        contentType: response.headers.get('content-type')
      }
    })
  }

  if (!response.ok) {
    logger.error('API error', { result })
    return toHookResponse({
      error: result.error || errorMessage || 'Something went wrong',
      status: result.statusCode || response.status,
      statusText: result.statusText || response.statusText,
      code: result.code,
      errorDetails: result.errorDetails || undefined
    })
  }

  // Extract data field from response
  let finalData
  if (result && typeof result === 'object' && 'data' in result) {
    finalData = result.data
  } else {
    finalData = result
  }
  
  return toHookResponse({
    data: finalData as T
  })
}

/**
 * Core API fetch utility with automatic authentication and error handling
 * 
 * **URL Behavior**: Pass the FULL URL path (e.g., '/api/users/123' or '/api/auth/login')
 * 
 * **Response Format**: Returns HookResponse<T> object:
 * - `{ data: T }` on success (extracts .data field from server response if present)
 * - `{ error: string, status: number, ... }` on failure
 * - NO 'success' property is included in the return value
 * 
 * **Authentication**: Automatically handles JWT tokens:
 * - Adds Authorization header if valid token exists
 * - Attempts token refresh if access token is expired
 * - Gracefully continues without auth if no valid tokens
 * 
 * @template T - The expected response data type
 * @param url - Full URL path (e.g., '/api/users/123')
 * @param options - Standard fetch options plus optional errorMessage
 * @returns Promise<HookResponse<T>> - Standardized response object
 * 
 * @example
 * ```typescript
 * // Success case
 * const { data, error } = await fetchApi<User>('/api/users/123')
 * if (data) {
 *   console.log('User:', data) // data is typed as User
 * }
 * 
 * // Error case
 * if (error) {
 *   console.error('Failed:', error)
 * }
 * ```
 */
export async function fetchApi<T = any>(
  url: string,
  options?: RequestInit & {
    errorMessage?: string
    auth?       : {
      apiKey         : string
      getAccessToken?: () => Promise<string | null>
    }
  }
): Promise<{
  data?        : T
  error?       : string
  status?      : number
  statusText?  : string
  code?        : ErrorCodeEnum | string
  errorDetails?: Record<string, any>
}> {
  const logger = Logger.instance('fetchApi', false)
  const { errorMessage, auth, ...fetchOptions } = options ?? {}
  const authConfig = auth ?? defaultAuthConfig

  if (!authConfig?.apiKey) {
    logger.error('Missing API key for REST request', { url })
    return {
      error     : 'Missing API key',
      status    : 401,
      statusText: 'Unauthorized',
      code      : 'PEEPS_API_KEY_MISSING',
    }
  }

  let accessToken: string | null = null

  if (authConfig.getAccessToken) {
    try {
      accessToken = await authConfig.getAccessToken()
    } catch (error) {
      logger.error('Failed to get access token', { error })
    }
  }

  const headers = new Headers(fetchOptions.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  headers.set(PEEPS_API_KEY_HEADER, authConfig.apiKey)
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  return handleHookResponse<T>(response, errorMessage)
}

/**
 * POST request utility with automatic JSON serialization and authentication
 * 
 * **URL Behavior**: Pass the FULL URL path (e.g., '/api/users' or '/api/auth/login')
 * 
 * **Body Serialization**: Automatically converts body to JSON string
 * - Sets Content-Type: application/json header
 * - Pass any serializable object as body parameter
 * 
 * **Response Format**: Returns HookResponse<T> object:
 * - `{ data: T }` on success (extracts .data field from server response if present)
 * - `{ error: string, status: number, ... }` on failure
 * - NO 'success' property is included in the return value
 * 
 * @template T - The expected response data type
 * @template B - The request body type
 * @param url - Full URL path (e.g., '/api/users')
 * @param body - Request body (will be JSON.stringify'd)
 * @param options - Additional fetch options and optional errorMessage
 * @returns Promise<HookResponse<T>> - Standardized response object
 * 
 * @example
 * ```typescript
 * const { data, error } = await postApi<User, CreateUserRequest>('/api/users', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * })
 * 
 * if (data) {
 *   console.log('Created user:', data)
 * } else if (error) {
 *   console.error('Failed to create user:', error)
 * }
 * ```
 */
export async function postApi<T = any, B = any>(
  url: string,
  body: B,
  options?: RequestInit & {
    errorMessage?: string
    auth?       : {
      apiKey         : string
      getAccessToken?: () => Promise<string | null>
    }
  }
) {
  return fetchApi<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options
  })
}

/**
 * PATCH request utility with automatic JSON serialization and authentication
 * 
 * **URL Behavior**: Pass the FULL URL path (e.g., '/api/users/123')
 * 
 * **Body Serialization**: Automatically converts body to JSON string
 * **Response Format**: Same as postApi - returns HookResponse<T>
 * 
 * @template T - The expected response data type
 * @template B - The request body type
 * @param url - Full URL path (e.g., '/api/users/123')
 * @param body - Request body (will be JSON.stringify'd)
 * @param options - Additional fetch options and optional errorMessage
 * @returns Promise<HookResponse<T>> - Standardized response object
 */
export async function patchApi<T = any, B = any>(
  url: string,
  body: B,
  options?: RequestInit & {
    errorMessage?: string
    auth?       : {
      apiKey         : string
      getAccessToken?: () => Promise<string | null>
    }
  }
) {
  return fetchApi<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...options
  })
}

/**
 * PUT request utility with automatic JSON serialization and authentication
 * 
 * **URL Behavior**: Pass the FULL URL path (e.g., '/api/users/123')
 * 
 * **Body Serialization**: Automatically converts body to JSON string
 * **Response Format**: Same as postApi - returns HookResponse<T>
 * 
 * @template T - The expected response data type
 * @template B - The request body type
 * @param url - Full URL path (e.g., '/api/users/123')
 * @param body - Request body (will be JSON.stringify'd)
 * @param options - Additional fetch options and optional errorMessage
 * @returns Promise<HookResponse<T>> - Standardized response object
 */
export async function putApi<T = any, B = any>(
  url: string,
  body: B,
  options?: RequestInit & {
    errorMessage?: string
    auth?       : {
      apiKey         : string
      getAccessToken?: () => Promise<string | null>
    }
  }
) {
  return fetchApi<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options
  })
}

/**
 * DELETE request utility with automatic JSON serialization and authentication
 * 
 * **URL Behavior**: Pass the FULL URL path (e.g., '/api/users/123')
 * 
 * **Body Serialization**: Automatically converts body to JSON string
 * **Response Format**: Same as postApi - returns HookResponse<T>
 * 
 * @template T - The expected response data type
 * @template B - The request body type
 * @param url - Full URL path (e.g., '/api/users/123')
 * @param body - Request body (will be JSON.stringify'd)
 * @param options - Additional fetch options and optional errorMessage
 * @returns Promise<HookResponse<T>> - Standardized response object
 */
export async function deleteApi<T = any, B = any>(
  url: string,
  body: B,
  options?: RequestInit & {
    errorMessage?: string
    auth?       : {
      apiKey         : string
      getAccessToken?: () => Promise<string | null>
    }
  }
) {
  return fetchApi<T>(url, {
    method: 'DELETE',
    body: JSON.stringify(body),
    ...options
  })
}

/**
 * POST request utility for form data (application/x-www-form-urlencoded)
 * 
 * **URL Behavior**: Pass the FULL URL path (e.g., '/api/auth/token')
 * 
 * **Body Format**: Expects pre-encoded form data string
 * - Sets Content-Type: application/x-www-form-urlencoded header
 * - Body should already be URL-encoded (e.g., 'key1=value1&key2=value2')
 * 
 * **Response Format**: Same as other APIs - returns HookResponse<T>
 * 
 * @template T - The expected response data type
 * @template B - The request body type (typically string)
 * @param url - Full URL path (e.g., '/api/auth/token')
 * @param options - Fetch options including pre-encoded body and optional errorMessage
 * @returns Promise<HookResponse<T>> - Standardized response object
 * 
 * @example
 * ```typescript
 * const formData = 'grant_type=password&username=user&password=pass'
 * const { data, error } = await postFormApi<TokenResponse>('/api/auth/token', {
 *   body: formData
 * })
 * ```
 */
export async function postFormApi<T = any, B = any>(
  url: string,
  options?: (RequestInit & {
    errorMessage?: string
    auth?       : {
      apiKey         : string
      getAccessToken?: () => Promise<string | null>
    }
  }) & { body?: B }
) {
  return fetchApi<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      ...options?.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: options?.body as string
  })
}