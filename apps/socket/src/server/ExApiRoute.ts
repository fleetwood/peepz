import type { Request, Response } from 'express'
import { serverEnv } from '@peeps/config/env'
import {
  ChainContext,
  ErrorCodeEnum,
  ValidationSourceEnum,
  errorCodeToStatusCode,
  type ApiErrorShape,
  type AuthedChainContext,
  type ServiceResult,
} from '@peeps/types'
import type { ZodTypeAny } from 'zod'
import { Logger } from '@peeps/utils'
import { createSupabaseVerifier, isServiceResult, normalizeError } from '@peeps/utils/apiRoute'

const logger = Logger.instance('ExApiRoute')

const supabaseTokenVerifier = createSupabaseVerifier(serverEnv.SUPABASE_URL)

type ExpressChainContext = ChainContext & {
  req      : Request
  res      : Response
  validated: Partial<Record<ValidationSourceEnum, unknown>>
}

type ExpressChainContextAuthed = Omit<ExpressChainContext, 'accessToken' | 'authUserId' | 'email'> & AuthedChainContext

type ExApiRouteAuthed = Omit<ExApiRoute, 'handle'> & {
  handle<T>(handler: (ctx: ExpressChainContextAuthed) => Promise<T>): Promise<void>
}

/**
 * Builder-pattern route handler for Express API routes (socket server).
 *
 * Express-adapted counterpart to {@link ApiRoute} (Next.js). Provides the same
 * fluent chain for assembling auth, pagination, validation, and handler logic,
 * with a single terminal `handle()` call that executes everything, normalizes
 * responses, and catches all errors.
 *
 * Differences from {@link ApiRoute}:
 * - Accepts Express `req`/`res` instead of a Web `Request`; writes to `res` directly
 *   rather than returning a `Response` object
 * - Exposes a `validate()` step for Zod schema validation of `body`, `query`, or `params`
 * - Injects `req`, `res`, and `validated` into `ctx` so handlers have full Express access
 * - `handle()` checks `res.headersSent` before writing to avoid double-send errors
 *
 * Design principles:
 * - **Builder**: each method mutates internal state and returns `this`
 * - **Deferred execution**: JWT verification and auth checks run inside `handle()`, not eagerly
 * - **Type-level DI**: `auth(true)` narrows the handler's `ctx` to {@link ExpressChainContextAuthed},
 *   guaranteeing `accessToken`, `authUserId`, and `email` are `string` at compile time
 * - **Context Object**: all chain state assembled into {@link ExpressChainContext} passed to handler
 * - **Error Barrier**: any thrown value is caught and normalized into a consistent JSON error response
 * - **Response Adapter**: handlers return raw data or a {@link ServiceResult}; `handle()` wraps both
 *   into `{ data: ... }` automatically
 *
 * @example Unauthenticated route
 * ```ts
 * router.get('/health', async (req, res) => {
 *   await new ExApiRoute(req, res)
 *     .handle(async () => ({ ok: true }))
 * })
 * ```
 *
 * @example Authenticated route with body validation
 * ```ts
 * router.post('/families', async (req, res) => {
 *   await new ExApiRoute(req, res)
 *     .auth(true)
 *     .validate(ValidationSourceEnum.BODY, CreateFamilySchema)
 *     .handle(async (ctx) => {
 *       const body = ctx.validated[ValidationSourceEnum.BODY] as CreateFamilyInput
 *       return FamilyService.create({ ...body, authUserId: ctx.authUserId })
 *     })
 * })
 * ```
 */
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

  /**
   * Writes a standardized JSON error response to the Express response.
   */
  private static jsonError(res: Response, value: ApiErrorShape) {
    res.status(value.statusCode).json(value)
  }

  /**
   * - On failure, stores the error in `sessionError`; `handle()` will surface it as a 401
   *   only if `auth(true)` was called.
   *
   * @returns `this` for chaining
   */
  async session() {
    if (!this.accessToken) return this
    if (this.currentSession) return this

    logger.debug('session')
    try {
      const verified = await supabaseTokenVerifier(this.accessToken)
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

  /**
   * Declares the authentication requirement for this route.
   *
   * **Overload behaviour:**
   * - `auth()` / `auth(false)` — marks auth as optional. The handler receives
   *   `ctx.authUserId?: string` and `ctx.email?: string` (may be undefined).
   * - `auth(true)` — marks auth as **required**. Returns {@link ExApiRouteAuthed}, which
   *   narrows the handler's `ctx` to {@link ExpressChainContextAuthed} so `accessToken`,
   *   `authUserId`, and `email` are typed as `string` (non-nullable). If the token is
   *   missing or invalid, `handle()` short-circuits with a `401` JSON response before
   *   the handler is ever called.
   *
   * @param required - `true` to enforce authentication and narrow context types
   * @returns `this` (or {@link ExApiRouteAuthed} when `required` is `true`)
   */
  auth(): this
  auth(required: false): this
  auth(required: true): ExApiRouteAuthed
  auth(required = false) {
    logger.debug('auth', { required })
    this.authRequired = required
    if (required) return this as unknown as ExApiRouteAuthed
    return this
  }

  /**
   * Parses and validates pagination parameters from the Express request URL,
   * then stores them for injection into `ctx.pagination` inside `handle()`.
   *
   * Query params read:
   * - `cursor` — opaque cursor string for keyset pagination (pass-through, no parsing)
   * - `limit`  — integer; clamped to `[1, 100]`; defaults to `params.limit ?? 20`
   *
   * @param params - Optional defaults to use when query params are absent
   * @param params.cursor - Default cursor value
   * @param params.limit  - Default page size (overridden by `?limit=` query param if present)
   * @returns `this` for chaining
   */
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

  /**
   * Validates multiple incoming data sources with Zod and stores parsed output on `ctx.validated`.
   *
   * Each validation result is stored under its source key in `this.validated`, which is then
   * passed to the handler as `ctx.validated`. Supports chaining multiple validations.
   *
   * Validation sources (see {@link ValidationSourceEnum}):
   * - `BODY`   — `req.body` (requires `express.json()` middleware upstream)
   * - `QUERY`  — `req.query`
   * - `PARAMS` — `req.params` (URL path parameters)
   *
   * Note: `FORM` is not supported in ExApiRoute. Use `options: { data }` to pass
   * pre-parsed form data if needed, or use ApiRoute for form data validation.
   *
   * Access validated data inside the handler via `ctx.validated.body`,
   * `ctx.validated.params`, etc.
   *
   * @param validations - Array of validation configs with target, schema, and optional data override
   * @returns `this` for chaining
   */
  validate(validations: Array<{ target: ValidationSourceEnum; schema: ZodTypeAny; options?: { data?: unknown } }>): this
  /**
   * Validates a single incoming data source with Zod and stores parsed output on `ctx.validated`.
   *
   * Validation sources (see {@link ValidationSourceEnum}):
   * - `BODY`   — `req.body` (requires `express.json()` middleware upstream)
   * - `QUERY`  — `req.query`
   * - `PARAMS` — `req.params` (URL path parameters)
   *
   * Note: `FORM` is not supported in ExApiRoute. Use `options: { data }` to pass
   * pre-parsed form data if needed, or use ApiRoute for form data validation.
   *
   * Throws synchronously on validation failure (Zod `ZodError`), which `handle()`
   * will catch and normalize into a JSON error response.
   *
   * Access validated data inside the handler via `ctx.validated[target]`.
   *
   * @param target - Which part of the request to validate ({@link ValidationSourceEnum})
   * @param schema - Zod schema to parse against
   * @param options - Optional config with `data` override to bypass parsing
   * @returns `this` for chaining
   * @throws {ZodError} if validation fails
   */
  validate(target: ValidationSourceEnum, schema: ZodTypeAny, options?: { data?: unknown }): this
  validate(
    targetOrValidations: ValidationSourceEnum | Array<{ target: ValidationSourceEnum; schema: ZodTypeAny; options?: { data?: unknown } }>,
    schema?: ZodTypeAny,
    options?: { data?: unknown },
  ): this {
    // Handle array of validations
    if (Array.isArray(targetOrValidations)) {
      for (const validation of targetOrValidations) {
        this.runValidation(validation.target, validation.schema, validation.options)
      }
      return this
    }

    // Handle single validation (original behavior)
    this.runValidation(targetOrValidations, schema!, options)
    return this
  }

  private runValidation(target: ValidationSourceEnum, schema: ZodTypeAny, options?: { data?: unknown }) {
    logger.debug('validate', { target })
    try {
      const source = options?.data !== undefined
        ? options.data
        : target === ValidationSourceEnum.BODY
          ? this.req.body
          : target === ValidationSourceEnum.QUERY
            ? this.req.query
            : this.req.params
      this.validated[target] = schema.parse(source)
    } catch (error) {
      logger.error('validate', error)
      throw error
    }
  }

  /**
   * Terminal method — executes the assembled chain and writes a JSON response to `res`.
   *
   * Execution order:
   * 1. Calls `session()` to verify the Bearer token (idempotent if already called)
   * 2. If `auth(true)` was declared, short-circuits with `401` if token is missing or invalid
   * 3. Assembles {@link ExpressChainContext} from all chain state and passes it to `handler`
   * 4. Checks `res.headersSent` after the handler returns — skips response writing if another
   *    middleware or the handler itself already sent a response
   * 5. Normalizes the handler's return value into a `{ data: ... }` JSON response:
   *    - If it matches {@link ServiceResult} shape (`{ status, result | error }`), unwraps `result`
   *    - Otherwise wraps the value directly as `{ data: value }`
   * 6. On any thrown error, calls `normalizeError` and writes the appropriate JSON error response
   *
   * When `auth(true)` was used, TypeScript narrows `ctx` to {@link ExpressChainContextAuthed},
   * guaranteeing `ctx.accessToken`, `ctx.authUserId`, and `ctx.email` are `string`.
   *
   * @param handler - Async function receiving the assembled {@link ExpressChainContext}
   * @returns `Promise<void>` — response is written directly to `res`
   */
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

      if (isServiceResult(data)) {
        this.res.json({ data: (data as ServiceResult).result })
        return
      }

      this.res.json({ data })
    } catch (error) {
      ExApiRoute.jsonError(this.res, normalizeError(error))
    }
  }
}
