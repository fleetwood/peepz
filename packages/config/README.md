# @peeps/config

Centralized configuration and environment variables for the Peeps application.

## Environment Variables

### ⚠️ Critical Security Pattern

**NEVER import `serverEnv` in client-side code!**

```typescript
// ✅ CORRECT - Client component
import { clientEnv } from '@peeps/config/env'

export function MyComponent() {
  const apiUrl = clientEnv.APP_URL  // Safe for browser
}

// ❌ WRONG - Client component
import { serverEnv } from '@peeps/config/env'

export function MyComponent() {
  const secret = serverEnv.RESEND_API_KEY  // 🚨 EXPOSES SECRET TO BROWSER!
}
```

### Client Environment (`clientEnv`)

**Safe to use in:**
- Client Components
- Browser code
- Mobile app
- Anywhere that runs in the browser

**Contains only:**
- `NEXT_PUBLIC_*` variables
- Public configuration
- No secrets or API keys

```typescript
import { clientEnv } from '@peeps/config/env'

// Available in clientEnv:
clientEnv.SUPABASE_URL           // Supabase project URL
clientEnv.SUPABASE_ANON_KEY      // Supabase anon/public key
clientEnv.CLOUDINARY_CLOUD_NAME  // Cloudinary cloud name
clientEnv.APP_URL                // App URL
clientEnv.NODE_ENV               // Environment (development/production)
```

### Server Environment (`serverEnv`)

**Safe to use in:**
- Server Components
- API Routes
- Server Actions
- Services
- Database operations
- Backend code only

**Contains:**
- All `clientEnv` variables (server can access public vars)
- Secrets and API keys
- Database credentials

```typescript
import { serverEnv } from '@peeps/config/env'

// Available in serverEnv (includes all clientEnv + secrets):
serverEnv.DATABASE_URL                 // PostgreSQL connection string
serverEnv.SUPABASE_SERVICE_ROLE_KEY   // Supabase admin key
serverEnv.CLOUDINARY_API_KEY          // Cloudinary API key
serverEnv.CLOUDINARY_API_SECRET       // Cloudinary API secret
serverEnv.RESEND_API_KEY              // Resend email API key
serverEnv.UPSTASH_REDIS_URL           // Redis URL
serverEnv.UPSTASH_REDIS_TOKEN         // Redis token
```

## Usage Examples

### In Services (Server-only)

```typescript
// packages/services/src/integrations/ResendService.ts
import { serverEnv } from '@peeps/config/env'
import { Resend } from 'resend'

const resend = new Resend(serverEnv.RESEND_API_KEY)  // ✅ Server-only
```

### In Database Client (Server-only)

```typescript
// packages/db/src/client.ts
import { serverEnv } from '@peeps/config/env'

export const client = postgres(serverEnv.DATABASE_URL)  // ✅ Server-only
```

### In Client Components (Browser)

```typescript
// apps/web/app/components/SupabaseProvider.tsx
'use client'
import { clientEnv } from '@peeps/config/env'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  clientEnv.SUPABASE_URL,      // ✅ Safe for browser
  clientEnv.SUPABASE_ANON_KEY  // ✅ Safe for browser
)
```

### In API Routes (Server)

```typescript
// apps/web/app/api/trpc/routers/email.ts
import { serverEnv } from '@peeps/config/env'

export const emailRouter = router({
  send: protectedProcedure
    .mutation(async () => {
      // ✅ Server-only - can use secrets
      await resend.emails.send({
        from: 'noreply@peeps.app',
        // ...
      })
    })
})
```

## Required Environment Variables

Create `.env.local` in the root with:

```env
# Database
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jelwyovbrdrpewjovpxe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123...

# Resend
RESEND_API_KEY=re_...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Validation

All required environment variables are validated on startup. Missing required vars will throw an error:

```
Error: Missing required environment variable: DATABASE_URL
```

## Type Safety

Both `clientEnv` and `serverEnv` are fully typed:

```typescript
import type { ClientEnv, ServerEnv } from '@peeps/config/env'

// TypeScript knows exactly what's available
const url: string = clientEnv.APP_URL  // ✅ Type-safe
const key: string = clientEnv.SECRET   // ❌ TypeScript error
```

## Best Practices

1. **Always use `clientEnv` in client code** - Never `serverEnv`
2. **Use `serverEnv` in server code** - It includes everything
3. **Prefix public vars with `NEXT_PUBLIC_`** - Next.js convention
4. **Never hardcode values** - Always use env config
5. **Validate required vars** - Use `getEnvVar()` with `required: true`

## Security Checklist

- ✅ Client components only import `clientEnv`
- ✅ Server components/routes use `serverEnv`
- ✅ No secrets in `clientEnv`
- ✅ All `NEXT_PUBLIC_*` vars are safe to expose
- ✅ Database credentials only in `serverEnv`
- ✅ API keys only in `serverEnv`
