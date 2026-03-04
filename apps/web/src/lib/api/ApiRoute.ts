import { serverEnv } from '@peeps/config/env'
import {
  ErrorCodeEnum,
  ValidationSourceEnum,
  errorCodeToStatusCode,
  type ApiErrorShape,
  type AuthedChainContext,
  type ChainContext,
  type PaginationParams,
  type ServiceResult,
} from '@peeps/types'
import { createSupabaseVerifier, isServiceResult, normalizeError } from '@peeps/utils'
import type { ZodTypeAny } from 'zod'

const supabaseTokenVerifier = createSupabaseVerifier(serverEnv.SUPABASE_URL)

type ApiRouteAuthed = Omit<ApiRoute, 'handle'> & {
  handle<T>(handler: (ctx: AuthedChainContext) => Promise<T>): Promise<Response>
}

/**
 * Builder-pattern route handler for Next.js API routes.
 *
 * Provides a fluent chain for assembling auth, pagination, and handler logic
 * with a single terminal `handle()` call that executes everything, normalizes
 * responses, and catches all errors.
 *
 * Design principles:
 * - **Builder**: each method mutates internal state and returns `this`
 * - **Deferred execution**: JWT verification and auth checks run inside `handle()`, not eagerly
 * - **Type-level DI**: `auth(true)` narrows the handler's `ctx` type so `authUserId`/`email`/`accessToken`
 *   are guaranteed non-nullable at compile time — no runtime null checks needed inside handlers
 * - **Context Object**: all chain state is assembled into a single {@link ChainContext} passed to the handler
 * - **Error Barrier**: any thrown value (structured error, `Error`, string, unknown) is caught and
 *   normalized into a consistent {@link ApiErrorShape} JSON response
 * - **Response Adapter**: handlers return raw data or a {@link ServiceResult}; `handle()` wraps both
 *   into `{ data: ... }` automatically
 *
 * @example Unauthenticated route
 * ```ts
 * export async function GET(request: Request) {
 *   return new ApiRoute(request)
 *     .handle(async (ctx) => FamilyService.list())
 * }
 * ```
 *
 * @example Authenticated route with pagination
 * ```ts
 * export async function GET(request: Request) {
 *   return new ApiRoute(request)
 *     .auth(true)
 *     .pagination()
 *     .handle(async (ctx) => {
 *       // ctx.authUserId and ctx.email are string (not string | undefined)
 *       return FamilyService.listForMember({ memberId: ctx.authUserId, ...ctx.pagination })
 *     })
 * }
 * ```
 */
export class ApiRoute {
  private request       : Request
  private accessToken   : string | null
  private currentSession: { authUserId: string; email: string } | null = null
  private sessionError  : unknown = null
  private authRequired  = false
  private paginationParams: PaginationParams | null = null
  private validated: Partial<Record<ValidationSourceEnum, unknown>> = {}
  private validationTasks: Array<Promise<void>> = []

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

  /**
   * Verifies the Bearer token from the `Authorization` header against Supabase's JWKS endpoint
   * and stores the resulting session (`authUserId`, `email`) on the instance.
   *
   * Called automatically by `handle()` — you do not need to call this manually.
   *
   * - No-ops if no token is present (unauthenticated requests are allowed through).
   * - No-ops if session has already been verified (idempotent).
   * - On failure, stores the error in `sessionError`; `handle()` will surface it as a 401
   *   only if `auth(true)` was called.
   *
   * @returns `this` for chaining
   */
  async session() {
    if (!this.accessToken) return this
    if (this.currentSession) return this

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
   * - `auth(true)` — marks auth as **required**. Returns {@link ApiRouteAuthed}, which
   *   narrows the handler's `ctx` so `accessToken`, `authUserId`, and `email` are
   *   typed as `string` (non-nullable). If the token is missing or invalid, `handle()`
   *   short-circuits with a `401` JSON response before the handler is ever called.
   *
   * @param required - `true` to enforce authentication and narrow context types
   * @returns `this` (or {@link ApiRouteAuthed} when `required` is `true`)
   */
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

  /**
   * Parses and validates pagination parameters from the request URL query string,
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

  /**
   * Validates incoming data with Zod and stores parsed output on `validatedData` for the handler.
   *
   * - BODY: parses `request.json()` once and validates
   * - QUERY: validates `URLSearchParams` as a plain object
   * - Throws for unsupported sources (e.g., PARAMS/FORM not implemented here)
   *
   * Parsing/validation is deferred: this method queues a Promise and returns `this` so chaining
   * (`.auth().pagination().validate().handle()`) stays synchronous; `handle()` awaits all queued
   * validations before calling the handler.
   */
  validate(target: ValidationSourceEnum, schema: ZodTypeAny, options?: { data?: unknown }) {
    const url = new URL(this.request.url)

    const parsePromise = options?.data !== undefined
      ? Promise.resolve(options.data)
      : target === ValidationSourceEnum.BODY
        ? this.request.json()
        : target === ValidationSourceEnum.FORM
          ? this.request.formData().then((fd) => Object.fromEntries(fd.entries()))
          : target === ValidationSourceEnum.QUERY
            ? Promise.resolve(Object.fromEntries(url.searchParams.entries()))
            : null

    if (parsePromise === null) {
      throw new Error(`Validation source not supported: ${target}`)
    }

    const task = parsePromise.then((data) => {
      this.validated[target] = schema.parse(data)
    })

    this.validationTasks.push(task)
    return this
  }

  /**
   * Terminal method — executes the assembled chain and sends a JSON response.
   *
   * Execution order:
   * 1. Calls `session()` to verify the Bearer token (idempotent if already called)
   * 2. If `auth(true)` was declared, short-circuits with `401` if token is missing or invalid
   * 3. Assembles {@link ChainContext} from all chain state and passes it to `handler`
   * 4. Normalizes the handler's return value into a `{ data: ... }` JSON response:
   *    - If the return value is already a `Response`, it is passed through unchanged
   *    - If it matches {@link ServiceResult} shape (`{ status, result | error }`), unwraps `result`
   *    - Otherwise wraps the value directly as `{ data: value }`
   * 5. On any thrown error, calls `normalizeError` and returns the appropriate JSON error response
   *
   * When `auth(true)` was used, TypeScript narrows `ctx` to {@link AuthedChainContext},
   * guaranteeing `ctx.accessToken`, `ctx.authUserId`, and `ctx.email` are `string`.
   *
   * @param handler - Async function receiving the assembled {@link ChainContext}
   * @returns A `Response` (JSON) — either the handler's data or a normalized error
   */
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
      await Promise.all(this.validationTasks)

      const ctx: ChainContext = {
        accessToken: this.accessToken,
        authUserId : this.currentSession?.authUserId,
        email      : this.currentSession?.email,
        pagination : this.paginationParams ?? undefined,
        validatedData: Object.keys(this.validated).length > 0 ? this.validated : undefined,
      }

      const data = await handler(ctx)

      if (data instanceof Response) {
        return data
      }

      if (isServiceResult(data)) {
        return Response.json({ data: (data as ServiceResult).result })
      }

      return Response.json({ data })
    } catch (error) {
      return ApiRoute.jsonError(normalizeError(error))
    }
  }
}