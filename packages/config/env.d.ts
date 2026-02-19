/**
 * Centralized environment variable configuration
 *
 * IMPORTANT:
 * - Use `clientEnv` for browser-safe variables (NEXT_PUBLIC_* only)
 * - Use `serverEnv` for server-only variables (secrets, API keys, etc.)
 * - NEVER import `serverEnv` in client-side code
 */
/**
 * Client-safe environment variables
 * Safe to use in browser/client components
 * Only includes NEXT_PUBLIC_* variables
 */
export declare const clientEnv: {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly API_KEY: string;
    readonly CLOUDINARY_CLOUD_NAME: string;
    readonly APP_URL: string;
    readonly SOCKET_URL: string;
    readonly NODE_ENV: string;
    readonly LOG_LEVEL: string;
    readonly APP_ENV: "development" | "staging" | "production";
    readonly isDev: boolean;
    readonly isStage: boolean;
    readonly isProd: boolean;
};
export declare const serverEnv: {
    readonly DATABASE_URL: string;
    readonly MONGODB_URI: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
    readonly CLOUDINARY_API_KEY: string;
    readonly CLOUDINARY_API_SECRET: string;
    readonly RESEND_API_KEY: string;
    readonly UPSTASH_REDIS_URL: string;
    readonly UPSTASH_REDIS_TOKEN: string;
    readonly SHAREDB_PORT: string;
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly API_KEY: string;
    readonly CLOUDINARY_CLOUD_NAME: string;
    readonly APP_URL: string;
    readonly SOCKET_URL: string;
    readonly NODE_ENV: string;
    readonly LOG_LEVEL: string;
    readonly APP_ENV: "development" | "staging" | "production";
    readonly isDev: boolean;
    readonly isStage: boolean;
    readonly isProd: boolean;
};
/**
 * @deprecated Use `serverEnv` instead for clarity
 */
export declare const env: {
    readonly DATABASE_URL: string;
    readonly MONGODB_URI: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
    readonly CLOUDINARY_API_KEY: string;
    readonly CLOUDINARY_API_SECRET: string;
    readonly RESEND_API_KEY: string;
    readonly UPSTASH_REDIS_URL: string;
    readonly UPSTASH_REDIS_TOKEN: string;
    readonly SHAREDB_PORT: string;
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly API_KEY: string;
    readonly CLOUDINARY_CLOUD_NAME: string;
    readonly APP_URL: string;
    readonly SOCKET_URL: string;
    readonly NODE_ENV: string;
    readonly LOG_LEVEL: string;
    readonly APP_ENV: "development" | "staging" | "production";
    readonly isDev: boolean;
    readonly isStage: boolean;
    readonly isProd: boolean;
};
//# sourceMappingURL=env.d.ts.map