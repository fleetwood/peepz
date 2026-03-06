import { useRuntimeConfig } from '#app'

type FetchOptions = {
  method     ?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body       ?: any
  headers    ?: Record<string, string>
  credentials?: RequestCredentials
}

type FetchResponse<T = any> = {
  data      ?: T
  error     ?: string
  status    ?: number
  statusText?: string
}

class ApiClient {
  private config: any
  private static instance: ApiClient

  private constructor() {
    // Config will be set when first accessed
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private getConfig() {
    if (!this.config) {
      this.config = useRuntimeConfig().public
    }
    return this.config
  }

  private async handleResponse<T>(response: Response): Promise<FetchResponse<T>> {
    let result: any

    try {
      result = await response.json()
    } catch (parseError) {
      console.error('API response parse error', { parseError, contentType: response.headers.get('content-type') })
      return {
        error: `Failed to parse response: ${response.statusText || 'Invalid JSON response'}`,
        status: response.status,
        statusText: response.statusText,
      }
    }

    if (!response.ok) {
      const isEmpty = result && typeof result === 'object' && Object.keys(result).length === 0
      const baseError = response.status === 401 ? 'Unauthorized' : 'Something went wrong'

      if (response.status !== 401) {
        console.error('API response error', isEmpty ? { status: response.status } : { result })
      }

      return {
        error: (isEmpty ? undefined : result.error) || baseError,
        status: (isEmpty ? undefined : result.statusCode) || response.status,
        statusText: (isEmpty ? undefined : result.statusText) || response.statusText,
      }
    }

    const data = result && typeof result === 'object' && 'data' in result ? result.data : result
    return { data: data as T }
  }

  private buildHeaders(extra?: HeadersInit): Headers {
    const headers = new Headers(extra)

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    // Add API key if available
    const config = this.getConfig()
    if (config.apiKey) {
      headers.set('x-peeps-api-key', config.apiKey)
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('supabase_access_token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
    }

    return headers
  }

  async fetch<T = any>(url: string, options?: FetchOptions): Promise<FetchResponse<T>> {
    const { method = 'GET', body, headers, credentials = 'include' } = options || {}
    const config = this.getConfig()

    const response = await fetch(`${config.apiUrl}/api${url}`, {
      method,
      headers: this.buildHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
      credentials,
    })

    return this.handleResponse<T>(response)
  }

  async get<T = any>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'GET' })
  }

  async post<T = any, B = any>(url: string, body: B, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'POST', body })
  }

  async put<T = any, B = any>(url: string, body: B, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'PUT', body })
  }

  async patch<T = any, B = any>(url: string, body: B, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'PATCH', body })
  }

  async delete<T = any>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<FetchResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'DELETE' })
  }
}

export default ApiClient.getInstance()
