  /**
 * Centralized environment variable configuration
 * 
 * IMPORTANT: 
 * - Use `clientEnv` for browser-safe variables (NEXT_PUBLIC_* only)
 * - Use `serverEnv` for server-only variables (secrets, API keys, etc.)
 * - NEVER import `serverEnv` in client-side code
 */

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key]
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  
  return value || ''
}

/**
 * Client-safe environment variables
 * Safe to use in browser/client components
 * Only includes NEXT_PUBLIC_* variables
 */
export const clientEnv = {
  SUPABASE_URL         : getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY    : getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  CLOUDINARY_CLOUD_NAME: getEnvVar('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
  APP_URL              : getEnvVar('NEXT_PUBLIC_APP_URL', false) || 'http://localhost:3000',
  NODE_ENV             : getEnvVar('NODE_ENV', false) || 'development',
  LOG_LEVEL            : getEnvVar('LOG_LEVEL', false) || 'ERROR',
} as const

/**
 * Server-only environment variables
 * NEVER import this in client-side code
 * Contains secrets and API keys
 */
export const serverEnv = {
    // All client vars are also available on server
  ...clientEnv,
  
    // Database
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  
    // Supabase (server-only)
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  
    // Cloudinary (server-only)
  CLOUDINARY_API_KEY   : getEnvVar('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET'),
  
    // Resend
  RESEND_API_KEY: getEnvVar('RESEND_API_KEY'),
  
    // Upstash Redis
  UPSTASH_REDIS_URL  : getEnvVar('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_TOKEN: getEnvVar('UPSTASH_REDIS_REST_TOKEN'),
} as const

  /**
 * @deprecated Use `serverEnv` instead for clarity
 */
export const env = serverEnv

export type ClientEnv = typeof clientEnv
export type ServerEnv = typeof serverEnv
