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

function resolveAppEnv(): 'development' | 'staging' | 'production' {
  const raw = (
    process.env.NEXT_PUBLIC_APP_ENV ||
    process.env.APP_ENV ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    'development'
  ).toLowerCase()

  if (raw === 'production' || raw === 'prod') return 'production'
  if (raw === 'staging' || raw === 'stage' || raw === 'preview') return 'staging'
  return 'development'
}

const APP_ENV = resolveAppEnv()

function getClientEnvVar(value: string | undefined, key: string, required: boolean = true): string {
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
  SUPABASE_URL         : getClientEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL', false)
                      || getClientEnvVar(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL, 'NEXT_PUBLIC_SUPABASE_PROJECT_URL', false),
  SUPABASE_ANON_KEY    : getClientEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', false)
                      || getClientEnvVar(process.env.NEXT_PUBLIC_SUPABASE_KEY, 'NEXT_PUBLIC_SUPABASE_KEY', false),
  API_KEY              : getClientEnvVar(process.env.NEXT_PUBLIC_API_KEY, 'NEXT_PUBLIC_API_KEY', false),
  CLOUDINARY_CLOUD_NAME: getClientEnvVar(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
  APP_URL              : getClientEnvVar(process.env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL', false) || 'http://localhost:3001',
  NODE_ENV             : getClientEnvVar(process.env.NODE_ENV, 'NODE_ENV', false) || 'development',
  LOG_LEVEL            : getClientEnvVar(process.env.LOG_LEVEL, 'LOG_LEVEL', false) || 'ERROR',
  APP_ENV              : APP_ENV,
  isDev                : APP_ENV === 'development',
  isStage              : APP_ENV === 'staging',
  isProd               : APP_ENV === 'production',
} as const

/**
 * Server-only environment variables
 * NEVER import this in client-side code
 * Contains secrets and API keys
 */
const buildServerEnv = () => {
  return {
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
}

export type ServerEnv = ReturnType<typeof buildServerEnv>

let cachedServerEnv: ServerEnv | null = null

export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop) {
    cachedServerEnv ??= buildServerEnv()
    return cachedServerEnv[prop as keyof ServerEnv]
  },
})

  /**
 * @deprecated Use `serverEnv` instead for clarity
 */
export const env = serverEnv

export type ClientEnv = typeof clientEnv
// ServerEnv is exported above (ReturnType<typeof buildServerEnv>)
