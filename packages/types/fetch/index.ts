import { ErrorCodeEnum } from '../base/errorCodes'

export type FetchAuthConfig = {
  apiKey          : string
  getAccessToken? : () => Promise<string | null>
  baseUrl?        : string
  apiPrefix?      : string
  unauthenticated?: boolean
}

export type FetchOptions = RequestInit & {
  errorMessage?: string
}

export type FetchResponse<T> = {
  data?        : T
  error?       : string
  status?      : number
  statusText?  : string
  code?        : ErrorCodeEnum | string
  errorDetails?: Record<string, any>
}
