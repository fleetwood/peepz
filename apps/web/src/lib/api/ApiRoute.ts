import { serverEnv } from '@peeps/config/env'
import { ErrorCodeEnum, errorCodeToMessage, errorCodeToStatusCode } from '@peeps/types'
import type { ChainContext, PaginationParams, ServiceResult } from '@peeps/types'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const supabaseJwks = createRemoteJWKSet(new URL(`${serverEnv.SUPABASE_URL}/auth/v1/.well-known/jwks.json`))

type ApiErrorShape = {
  error        : string
  code         : ErrorCodeEnum | string
  statusCode   : number
  statusText?  : string
  errorDetails?: Record<string, unknown>
}

type AuthedChainContext = Omit<ChainContext, 'accessToken' | 'authUserId' | 'email'> & {
  accessToken: string
  authUserId : string
  email      : string
}

type ApiRouteAuthed = Omit<ApiRoute, 'handle'> & {
  handle<T>(handler: (ctx: AuthedChainContext) => Promise<T>): Promise<Response>
}

export class ApiRoute {
  private request       : Request
  private accessToken   : string | null
  private currentSession: { authUserId: string; email: string } | null = null
  private sessionError  : unknown = null
  private authRequired  = false
  private paginationParams: PaginationParams | null = null

  constructor(request: Request) {
    this.request = request
    this.accessToken = ApiRoute.getBearerToken(request)
  }

  private static getBearerToken(request: Request): string | null {
    const header = request.headers.get('authorization')
    if (!header) return null

    const [scheme, token] = header.split(' ')
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null

    return token
  }

  private static jsonError(value: ApiErrorShape) {
    return Response.json(value, { status: value.statusCode })
  }

  private static async verifyAccessToken(accessToken: string): Promise<{ authUserId: string; email: string | null }> {
    const issuer = `${serverEnv.SUPABASE_URL}/auth/v1`
    const { payload } = await jwtVerify(accessToken, supabaseJwks, { issuer, audience: 'authenticated' })

    const authUserId = typeof payload.sub === 'string' ? payload.sub : ''
    const email = typeof payload.email === 'string' ? payload.email : null

    if (!authUserId) {
      throw new Error('Invalid access token: missing sub claim')
    }

    return { authUserId, email }
  }

  private static normalizeError(error: unknown): ApiErrorShape {
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

  private static isServiceResultLike(value: unknown): value is ServiceResult {
    if (!value || typeof value !== 'object') return false
    return 'status' in value && ('result' in value || 'error' in value)
  }

  async session() {
    if (!this.accessToken) return this
    if (this.currentSession) return this

    try {
      const verified = await ApiRoute.verifyAccessToken(this.accessToken)
      if (!verified.email) {
        this.sessionError = {
          error     : 'Supabase user missing email',
          code      : ErrorCodeEnum.API_BAD_REQUEST,
          statusCode: errorCodeToStatusCode[ErrorCodeEnum.API_BAD_REQUEST],
        } satisfies ApiErrorShape

        return this
      }

      this.currentSession = { authUserId: verified.authUserId, email: verified.email }
    } catch (error) {
      this.sessionError = error
    }

    return this
  }

  auth(): this
  auth(required: false): this
  auth(required: true): ApiRouteAuthed
  auth(required = false) {
    this.authRequired = required

    if (required) {
      return this as unknown as ApiRouteAuthed
    }

    return this
  }

  pagination(params?: Partial<PaginationParams>) {
    const url = new URL(this.request.url)

    const cursorParam = url.searchParams.get('cursor')
    const limitParam = url.searchParams.get('limit')

    const limitFallback = params?.limit ?? 20
    const limitFromQuery = limitParam ? Number.parseInt(limitParam, 10) : limitFallback
    const limit = Number.isFinite(limitFromQuery) ? Math.min(Math.max(limitFromQuery, 1), 100) : limitFallback

    this.paginationParams = {
      cursor: params?.cursor ?? (cursorParam && cursorParam.length > 0 ? cursorParam : null),
      limit,
    }

    return this
  }

  async handle<T>(handler: (ctx: ChainContext) => Promise<T>) {
    await this.session()

    if (this.authRequired) {
      if (!this.accessToken) {
        return ApiRoute.jsonError({
          error     : 'Missing bearer token',
          code      : ErrorCodeEnum.AUTH_REQUIRED,
          statusCode: errorCodeToStatusCode[ErrorCodeEnum.AUTH_REQUIRED],
        })
      }

      if (!this.currentSession) {
        return ApiRoute.jsonError({
          error       : 'Invalid bearer token',
          code        : ErrorCodeEnum.AUTH_INVALID_TOKEN,
          statusCode  : errorCodeToStatusCode[ErrorCodeEnum.AUTH_INVALID_TOKEN],
          errorDetails: this.sessionError ? { cause: String(this.sessionError) } : undefined,
        })
      }
    }

    try {
      const ctx: ChainContext = {
        accessToken: this.accessToken,
        authUserId : this.currentSession?.authUserId,
        email      : this.currentSession?.email,
        pagination : this.paginationParams ?? undefined,
      }

      const data = await handler(ctx)

      if (data instanceof Response) {
        return data
      }

      if (ApiRoute.isServiceResultLike(data)) {
        return Response.json({ data: data.result })
      }

      return Response.json({ data })
    } catch (error) {
      return ApiRoute.jsonError(ApiRoute.normalizeError(error))
    }
  }
}