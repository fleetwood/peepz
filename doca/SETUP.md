# Peeps Project Setup Guide

## Prerequisites

- Node.js 18+ and pnpm installed
- Git installed
- Vercel account (free tier)
- Clerk account (free tier)
- Cloudinary account (free tier)
- Pusher account (free tier)
- Resend account (free tier)
- Upstash account (free tier)
- Stripe account (for future freemium features)

---

## Phase 1: Initial Setup

### Step 1: Create Next.js Project

```bash
pnpm create next-app@latest peeps --typescript --tailwind --app --use-pnpm
cd peeps
```

**Configuration options:**
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: `@/*`

### Step 2: Install Core Dependencies

```bash
# UI Components
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react

# Forms & Validation
pnpm add react-hook-form @hookform/resolvers zod

# State Management
pnpm add zustand

# Data Fetching
pnpm add @tanstack/react-query

# Database & ORM
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# Auth
pnpm add @clerk/nextjs

# File Upload
pnpm add cloudinary next-cloudinary

# Real-time
pnpm add pusher pusher-js

# Email
pnpm add resend

# Payments
pnpm add stripe @stripe/stripe-js

# Redis Queue
pnpm add ioredis bullmq

# Dev Dependencies
pnpm add -D @types/node prettier eslint-config-prettier
```

### Step 3: Initialize shadcn/ui

```bash
pnpm dlx shadcn-ui@latest init
```

**Configuration:**
- Style: Default
- Base color: Slate
- CSS variables: Yes (for theming)

**Install initial components:**
```bash
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add form
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add avatar
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add toast
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add select
pnpm dlx shadcn-ui@latest add calendar
pnpm dlx shadcn-ui@latest add badge
pnpm dlx shadcn-ui@latest add separator
```

### Step 4: Configure Tailwind Theme Variables

Update `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 5: Set Up Environment Variables

Create `.env.local`:

```bash
# Database (Vercel Postgres or Neon)
DATABASE_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY="..."
PUSHER_APP_ID="..."
PUSHER_SECRET="..."
NEXT_PUBLIC_PUSHER_CLUSTER="..."

# Resend
RESEND_API_KEY="re_..."

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Stripe (for future freemium)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 6: Initialize Drizzle ORM

Create `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

Create `src/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
```

### Step 7: Configure Clerk Auth

Update `src/app/layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Peeps - Family Social Platform',
  description: 'Connect with family across all communication channels',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

Create `src/middleware.ts`:

```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### Step 8: Set Up Tanstack Query

Create `src/providers/query-provider.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

Update `src/app/layout.tsx` to include QueryProvider.

### Step 9: Configure Prettier

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "arrowParens": "always"
}
```

Create `.prettierignore`:

```
node_modules
.next
out
dist
build
*.lock
package-lock.json
pnpm-lock.yaml
```

### Step 10: Project Structure

Create the following directory structure:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── people/
│   │   ├── groups/
│   │   ├── messages/
│   │   ├── events/
│   │   └── albums/
│   ├── api/
│   │   ├── webhooks/
│   │   └── trpc/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/              (shadcn components)
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── people/
│   ├── groups/
│   ├── messages/
│   ├── events/
│   └── albums/
├── db/
│   ├── index.ts
│   └── schema.ts
├── lib/
│   ├── utils.ts
│   ├── validations/
│   ├── hooks/
│   └── constants.ts
├── stores/
│   └── use-user-store.ts
├── types/
│   └── index.ts
└── middleware.ts
```

---

## Service Setup Instructions

### Supabase Setup (Database + Auth)

1. Go to supabase.com
2. Create new project
3. Choose region closest to your users
4. Set database password (save this!)
5. Wait for project to provision (~2 minutes)

**Get API Keys:**
6. Go to Project Settings > API
7. Copy to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - Format: `https://[project-ref].supabase.co`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Long JWT token starting with `eyJ...`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`
     - Long JWT token (server-only, never expose to client)

**Get Database Connection:**
8. Go to Project Settings > Database
9. Copy **Connection String** (URI format) → `DATABASE_URL`
   - Format: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`
   - Replace `[password]` with your database password

**Enable OAuth Providers (Optional):**
1. Go to Authentication > Providers
2. Enable desired providers (Google, Facebook, GitHub, etc.)
3. Add OAuth credentials from each provider
4. Configure redirect URLs

**Row Level Security:**
- Supabase uses RLS for database-level security
- Define policies in SQL Editor or Dashboard
- Perfect for family privacy model

### Cloudinary Setup

1. Go to cloudinary.com
2. Sign up for free account
3. Go to Dashboard
4. Copy Cloud Name, API Key, API Secret to `.env.local`
5. Enable unsigned uploads (Settings > Upload)

### Pusher Setup

1. Go to pusher.com
2. Create Channels app
3. Select free tier (Sandbox)
4. Copy credentials to `.env.local`
5. Enable client events if needed

### Resend Setup

1. Go to resend.com
2. Sign up for free account
3. Verify domain (or use onboarding domain for testing)
4. Create API key
5. Copy to `.env.local`

### Upstash Redis Setup

1. Go to upstash.com
2. Create Redis database
3. Select free tier
4. Copy REST URL and token to `.env.local`

### Stripe Setup (Future)

1. Go to stripe.com
2. Create account
3. Get test API keys from Dashboard
4. Copy to `.env.local`
5. Set up webhook endpoint later

---

## Development Workflow

### Start Development Server

```bash
pnpm dev
```

### Database Migrations

```bash
# Generate migration
pnpm drizzle-kit generate:pg

# Push to database
pnpm drizzle-kit push:pg

# Open Drizzle Studio
pnpm drizzle-kit studio
```

### Code Quality

```bash
# Lint
pnpm lint

# Format
pnpm prettier --write .

# Type check
pnpm tsc --noEmit
```

---

## Next Steps After Setup

1. Create base database schema in `src/db/schema.ts`
2. Set up authentication pages
3. Create dashboard layout
4. Build user profile page
5. Implement person management

---

## Troubleshooting

### Database Connection Issues
- Verify connection string format
- Check if database is running
- Ensure IP is whitelisted (Neon)

### Clerk Auth Issues
- Verify API keys are correct
- Check redirect URLs match
- Ensure middleware is configured

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
- Check for TypeScript errors: `pnpm tsc --noEmit`

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Clerk Docs](https://clerk.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tanstack Query Docs](https://tanstack.com/query)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
