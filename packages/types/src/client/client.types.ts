/**
 * Shared HTTP client configuration for all client factories.
 * Used by family, notifications, onboarding, and other domain clients.
 */
export type ClientHttpConfig = {
  baseUrl: string
  apiKey?: string
  fetchFn?: typeof fetch
}
