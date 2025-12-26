# Peeps Setup Guide

Family-centered social platform built with Turborepo monorepo architecture.

## Prerequisites

- **Node.js 18+** installed
- **pnpm 8+** installed
- **Git** installed
- **GitHub** account
- **Supabase** account (free tier - database + auth)
- **Cloudinary** account (free tier - media storage)
- **Pusher** account (optional - can use Supabase Realtime)
- **Resend** account (free tier - email)
- **Upstash Redis** account (free tier - queues)
- **Stripe** account (for future payments)

---

## Quick Start

### 1. Clone Repository

```bash
git clone git@github.com:fleetwood/peepz.git
cd peepz
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for the monorepo workspaces:

**Root workspace:**
- Turborepo (build orchestration)
- Prettier (code formatting)

**API (`apps/api`):**
- Express + tRPC + Drizzle ORM
- Supabase Auth
- BullMQ + ioredis (Redis queues)
- Resend (email)
- Cloudinary (media)
- Pusher (real-time)
- Stripe (payments)
- Drizzle Kit (migrations)

**Web (`apps/web`):**
- Next.js 15 + React 18.3.1
- TanStack Query + tRPC client
- Supabase Auth SDK
- shadcn/ui components (Radix UI)
- React Hook Form + Zod
- Zustand (state)
- Lucide icons
- next-cloudinary
- pusher-js
- Stripe client

**Mobile (`apps/mobile`):**
- Expo 52 + React Native
- TanStack Query + tRPC client
- Supabase Auth SDK
- Zustand (state)
- Expo modules (camera, notifications, secure-store)
- pusher-js

**Shared packages:**
- `packages/types` - TypeScript types + Zod schemas
- `packages/utils` - Shared utilities
- `packages/config` - ESLint/Prettier configs

### 3. Set Up Environment Variables

Create `.env.local` in the root:

```bash
# Supabase (Database + Auth)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Cloudinary (Media Storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Pusher (Real-time - optional, can use Supabase Realtime)
NEXT_PUBLIC_PUSHER_APP_KEY=your-app-key
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster

# Resend (Email)
RESEND_API_KEY=re_...

# Upstash Redis (Queues)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Stripe (Payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:4000
```

### 4. Set Up Supabase

See [Service Setup](#supabase-setup) below for detailed instructions.

### 5. Initialize Database

```bash
# Generate Drizzle schema
cd apps/api
pnpm drizzle-kit generate

# Push to Supabase
pnpm drizzle-kit push
```

### 6. Start Development

```bash
# From root - starts all apps
pnpm dev

# Or start individual apps
pnpm dev --filter=@peeps/api
pnpm dev --filter=@peeps/web
pnpm dev --filter=@peeps/mobile
```

**URLs:**
- Web: http://localhost:3000
- API: http://localhost:4000
- Mobile: Expo DevTools will open

---

## Service Setup

### Supabase Setup (Database + Auth)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region closest to your users
4. Set database password (save this!)
5. Wait for project to provision (~2 minutes)

**Get API Keys:**

6. Go to **Project Settings > API**
7. Copy to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - Format: `https://[project-ref].supabase.co`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Long JWT token starting with `eyJ...`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`
     - Long JWT token (server-only, never expose to client)

**Get Database Connection:**

8. Go to **Project Settings > Database**
9. Copy **Connection String** (URI format) → `DATABASE_URL`
   - Format: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`
   - Replace `[password]` with your database password

**Enable OAuth Providers (Optional):**

1. Go to **Authentication > Providers**
2. Enable desired providers (Google, Facebook, GitHub, etc.)
3. Add OAuth credentials from each provider
4. Configure redirect URLs

**Row Level Security:**
- Supabase uses RLS for database-level security
- Define policies in SQL Editor or Dashboard
- Perfect for family privacy model

### Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard
4. Copy to `.env.local`:
   - Cloud Name → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`
5. Enable unsigned uploads (Settings > Upload)

### Pusher Setup (Optional)

**Note:** Can use Supabase Realtime instead

1. Go to [pusher.com](https://pusher.com)
2. Create Channels app
3. Select free tier (Sandbox)
4. Copy credentials to `.env.local`
5. Enable client events if needed

### Resend Setup

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Create API key
4. Copy to `.env.local` → `RESEND_API_KEY`
5. Verify domain (optional for production)

### Upstash Redis Setup

1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Select free tier
4. Copy REST URL and Token to `.env.local`

### Stripe Setup (Future)

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Get test API keys from Dashboard
4. Copy to `.env.local`
5. Set up webhook endpoint later

---

## Project Structure

```
peepz/
├── apps/
│   ├── api/              # Express + tRPC API server
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── trpc/
│   │   │   ├── routes/
│   │   │   └── db/
│   │   └── package.json
│   ├── web/              # Next.js 15 web app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── package.json
│   └── mobile/           # Expo React Native app
│       ├── app/
│       ├── components/
│       └── package.json
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Shared utilities
│   └── config/           # Shared configs
├── doca/                 # Documentation
├── .gitignore
├── turbo.json            # Turborepo config
├── pnpm-workspace.yaml   # pnpm workspace config
└── package.json          # Root package
```

---

## Development Workflow

### Start Development Servers

```bash
# All apps
pnpm dev

# Individual apps
pnpm dev --filter=@peeps/api
pnpm dev --filter=@peeps/web
pnpm dev --filter=@peeps/mobile
```

### Build for Production

```bash
# All apps
pnpm build

# Individual apps
pnpm build --filter=@peeps/web
```

### Linting

```bash
# All apps
pnpm lint

# Individual apps
pnpm lint --filter=@peeps/web
```

### Format Code

```bash
pnpm format
```

### Database Migrations

```bash
cd apps/api

# Generate migration from schema changes
pnpm drizzle-kit generate

# Push to database
pnpm drizzle-kit push

# Open Drizzle Studio (database GUI)
pnpm drizzle-kit studio
```

### Add Dependencies

```bash
# To specific workspace
pnpm add <package> --filter=@peeps/web

# To root
pnpm add -w <package>

# Dev dependency
pnpm add -D <package> --filter=@peeps/api
```

---

## Tech Stack

### API (`apps/api`)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **API**: tRPC 11 (type-safe)
- **Database**: Supabase PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth
- **Validation**: Zod

### Web (`apps/web`)
- **Framework**: Next.js 15 (App Router)
- **React**: 18.3.1
- **Styling**: TailwindCSS + shadcn/ui
- **State**: Zustand
- **Data**: TanStack Query + tRPC
- **Auth**: Supabase Auth SDK

### Mobile (`apps/mobile`)
- **Framework**: React Native (Expo 52)
- **Navigation**: Expo Router
- **State**: Zustand
- **Data**: TanStack Query + tRPC
- **Auth**: Supabase Auth SDK

### Shared
- **TypeScript**: 5.7.2
- **Validation**: Zod 3.24.1
- **Monorepo**: Turborepo + pnpm workspaces

---

## Next Steps

1. **Set up Drizzle schema** - Define data models in `apps/api/src/db/schema.ts`
2. **Create tRPC routers** - Define API endpoints in `apps/api/src/trpc/routers/`
3. **Build auth UI** - Custom login/signup pages in web app
4. **Set up Supabase RLS** - Define Row Level Security policies
5. **Add shadcn/ui components** - Install needed UI components for web
6. **Configure Expo** - Set up app.json for mobile

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

### pnpm Install Fails

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Turborepo Cache Issues

```bash
# Clear Turborepo cache
rm -rf .turbo
pnpm dev
```

### Database Connection Issues

- Verify `DATABASE_URL` in `.env.local`
- Check Supabase project is running
- Verify IP is allowed in Supabase settings
- Test connection with `psql` or database client

---

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [Business Rules](./BUSINESS-RULES.md)
- [Coding Standards](./CODING-STANDARDS.md)
- [Data Models](./model.md)
- [Privacy Strategy](./PRIVACY-FIRST-STRATEGY.md)

---

## Support

- GitHub Issues: https://github.com/fleetwood/peepz/issues
- Documentation: `/doca` folder
