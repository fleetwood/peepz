import { ErrorCodeEnum, type FetchAuthConfig, type FetchOptions, type FetchResponse } from '@peeps/types'
import { PEEPS_API_KEY_HEADER } from '@peeps/config/constants/queryManager'
import { clientEnv } from '@peeps/config/env'

import { Logger } from '../logger'

export class FetchBase {
  private config: FetchAuthConfig
  private logger = Logger.instance('FetchBase', false)

  constructor(config: FetchAuthConfig) {
    this.config = {
      ...config,
      apiKey : clientEnv.API_KEY,
      baseUrl: clientEnv.APP_URL,
    }
  }

  private resolveUrl(raw: string): string {
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw

    const baseUrl   = this.config.baseUrl ?? ''
    const apiPrefix = this.config.apiPrefix ?? ''
    const path      = raw.startsWith('/') ? raw : `/${raw}`

    if (!apiPrefix || path === apiPrefix || path.startsWith(`${apiPrefix}/`)) {
      return `${baseUrl}${path}`
    }

    return `${baseUrl}${apiPrefix}${path}`
  }

  private async handleResponse<T>(response: Response, errorMessage?: string): Promise<FetchResponse<T>> {
    let result: any

    try {
      result = await response.json()
    } catch (parseError) {
      this.logger.error('response.parseError', { parseError, contentType: response.headers.get('content-type') })
      return {
        error      : `Failed to parse response: ${response.statusText || 'Invalid JSON response'}`,
        status     : response.status,
        statusText : response.statusText,
        code       : ErrorCodeEnum.API_INTERNAL_ERROR,
        errorDetails: {
          parseError : parseError instanceof Error ? parseError.message : String(parseError),
          contentType: response.headers.get('content-type'),
        },
      }
    }

    if (!response.ok) {
      const isEmpty   = result && typeof result === 'object' && Object.keys(result).length === 0
      const baseError = response.status === 401 ? 'Unauthorized' : 'Something went wrong'

      if (response.status !== 401) {
        this.logger.error('response.error', isEmpty ? { status: response.status } : { result })
      }

      return {
        error       : (isEmpty ? undefined : result.error) || errorMessage || baseError,
        status      : (isEmpty ? undefined : result.statusCode) || response.status,
        statusText  : (isEmpty ? undefined : result.statusText) || response.statusText,
        code        : isEmpty ? undefined : result.code,
        errorDetails: isEmpty ? undefined : result.errorDetails,
      }
    }

    const data = result && typeof result === 'object' && 'data' in result ? result.data : result
    return { data: data as T }
  }

  private async buildHeaders(extra?: HeadersInit): Promise<Headers> {
    const headers = new Headers(extra)

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    headers.set(PEEPS_API_KEY_HEADER, this.config.apiKey)

    // Get auth token if provided via config
    if (this.config.getAccessToken) {
      try {
        const token = await this.config.getAccessToken()
        if (token) headers.set('Authorization', `Bearer ${token}`)
      } catch (error) {
        this.logger.error('getAccessToken', { error })
      }
    }

    return headers
  }

  async fetch<T = any>(url: string, options?: FetchOptions): Promise<FetchResponse<T>> {
    if (!this.config.unauthenticated && !this.config.apiKey) {
      this.logger.error('fetch.missingApiKey', { url })
      return { error: 'Missing API key', status: 401, statusText: 'Unauthorized', code: 'PEEPS_API_KEY_MISSING' }
    }

    const { errorMessage, ...fetchOptions } = options ?? {}
    const headers = await this.buildHeaders(fetchOptions.headers)

    const response = await globalThis.fetch(this.resolveUrl(url), { ...fetchOptions, headers })
    return this.handleResponse<T>(response, errorMessage)
  }

  async post<T = any, B = any>(url: string, body: B, options?: FetchOptions): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) })
  }

  async patch<T = any, B = any>(url: string, body: B, options?: FetchOptions): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(body) })
  }

  async put<T = any, B = any>(url: string, body: B, options?: FetchOptions): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) })
  }

  async delete<T = any, B = any>(url: string, body?: B, options?: FetchOptions): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'DELETE', body: body ? JSON.stringify(body) : undefined })
  }

  async postForm<T = any>(url: string, options?: FetchOptions & { body?: string }): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method : 'POST',
      headers: { ...options?.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  }

}