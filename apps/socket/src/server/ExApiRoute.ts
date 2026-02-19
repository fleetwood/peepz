import type { Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { serverEnv } from '@peeps/config/env'
import {
  ChainContext,
  ErrorCodeEnum,
  ValidationSourceEnum,
  errorCodeToMessage,
  errorCodeToStatusCode,
  type ServiceResult,
} from '@peeps/types'
import type { ZodTypeAny } from 'zod'
import { Logger } from '@peeps/utils'

const logger = Logger.instance('ExApiRoute')

type ApiErrorShape = {
  error        : string
  code         : ErrorCodeEnum | string
  statusCode   : number
  statusText?  : string
  errorDetails?: Record<string, unknown>
}

const supabaseJwks = createRemoteJWKSet(new URL(`${serverEnv.SUPABASE_URL}/auth/v1/.well-known/jwks.json`))

type AuthedChainContext = Omit<ChainContext, 'accessToken' | 'authUserId' | 'email'> & {
  accessToken: string
  authUserId : string
  email      : string
}

type ExpressChainContext = ChainContext & {
  req      : Request
  res      : Response
  validated: Partial<Record<ValidationSourceEnum, unknown>>
}

type ExpressChainContextAuthed = Omit<ExpressChainContext, 'accessToken' | 'authUserId' | 'email'> & AuthedChainContext

type ExApiRouteAuthed = Omit<ExApiRoute, 'handle'> & {
  handle<T>(handler: (ctx: ExpressChainContextAuthed) => Promise<T>): Promise<void>
}

export class ExApiRoute {
  private accessToken   : string | null
  private currentSession: { authUserId: string; email: string } | null = null
  private sessionError  : unknown = null
  private authRequired  = false
  private paginationParams: ChainContext['pagination']
  private validated: Partial<Record<ValidationSourceEnum, unknown>> = {}

  constructor(private req: Request, private res: Response) {
    this.accessToken = ExApiRoute.getBearerToken(req)
  }

  private static getBearerToken(request: Request): string | null {
    const header = request.header('authorization')
    if (!header) return null

    const [scheme, token] = header.split(' ')
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null

    return token
  }

  private static jsonError(res: Response, value: ApiErrorShape) {
    res.status(value.statusCode).json(value)
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

    logger.debug('session')
    try {
      const verified = await ExApiRoute.verifyAccessToken(this.accessToken)
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
      logger.error('session', error)
      this.sessionError = error
    }

    return this
  }

  auth(): this
  auth(required: false): this
  auth(required: true): ExApiRouteAuthed
  auth(required = false) {
    logger.debug('auth', { required })
    this.authRequired = required
    if (required) return this as unknown as ExApiRouteAuthed
    return this
  }

  pagination(params?: Partial<ChainContext['pagination']>) {
    logger.debug('pagination', { params })
    const url = new URL(this.req.protocol + '://' + this.req.get('host') + this.req.originalUrl)
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

  validate(target: ValidationSourceEnum, schema: ZodTypeAny) {
    logger.debug('validate', { target })
    try {
      const source = target === ValidationSourceEnum.BODY ? this.req.body : target === ValidationSourceEnum.QUERY ? this.req.query : this.req.params
      this.validated[target] = schema.parse(source)
    } catch (error) {
      logger.error('validate', error)
      throw error
    }
    return this
  }

  async handle<T>(handler: (ctx: ExpressChainContext) => Promise<T>): Promise<void> {
    logger.debug('handle')
    await this.session()

    if (this.authRequired) {
      if (!this.accessToken) {
        return ExApiRoute.jsonError(this.res, {
          error     : 'Missing bearer token',
          code      : ErrorCodeEnum.AUTH_REQUIRED,
          statusCode: errorCodeToStatusCode[ErrorCodeEnum.AUTH_REQUIRED],
        })
      }

      if (!this.currentSession) {
        return ExApiRoute.jsonError(this.res, {
          error       : 'Invalid bearer token',
          code        : ErrorCodeEnum.AUTH_INVALID_TOKEN,
          statusCode  : errorCodeToStatusCode[ErrorCodeEnum.AUTH_INVALID_TOKEN],
          errorDetails: this.sessionError ? { cause: String(this.sessionError) } : undefined,
        })
      }
    }

    try {
      // ctx exposes only what handlers need — keeps internal chain state (session, auth) private
      const ctx: ExpressChainContext = {
        ...this.currentSession,
        accessToken: this.accessToken,
        pagination : this.paginationParams ?? undefined,
        req        : this.req,
        res        : this.res,
        validated  : this.validated,
      }

      const data = await handler(ctx)

      if (this.res.headersSent) return

      if (ExApiRoute.isServiceResultLike(data)) {
        this.res.json({ data: (data as ServiceResult).result })
        return
      }

      this.res.json({ data })
    } catch (error) {
      ExApiRoute.jsonError(this.res, ExApiRoute.normalizeError(error))
    }
  }
}
