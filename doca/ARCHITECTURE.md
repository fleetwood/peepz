# Peeps Multi-Platform Architecture

## Overview

Peeps uses a **monorepo architecture** with four separate codebases:

1. **API** - Backend REST/tRPC API (Node.js/Express)
2. **Web** - Next.js web application
3. **Mobile** - React Native mobile app (iOS/Android)
4. **Shared** - Shared UI components, types, and utilities

---

## Monorepo Structure

```
peeps/
├── apps/
│   ├── api/              # Backend API server
│   ├── web/              # Next.js web app
│   └── mobile/           # React Native app
├── packages/
│   ├── ui/               # Shared UI components
│   ├── types/            # Shared TypeScript types
│   ├── config/           # Shared configs (ESLint, TS, etc)
│   └── utils/            # Shared utilities
├── package.json
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Technology Stack by Codebase

### 1. API (`apps/api`)

**Purpose**: Secure backend API accessible by both web and mobile clients

**Stack:**
- **Runtime**: Node.js 18+
- **Framework**: Express.js or Fastify
- **API Layer**: tRPC (type-safe API) + REST endpoints
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Supabase Auth (JWT validation for mobile/web)
- **Real-time**: Pusher or Socket.io
- **File Upload**: Cloudinary SDK
- **Email**: Resend
- **SMS**: Twilio (deferred)
- **Queue**: BullMQ + Upstash Redis
- **Validation**: Zod
- **Payments**: Stripe

**Key Features:**
- JWT-based authentication (Supabase tokens)
- Rate limiting per client
- CORS configuration for web/mobile
- API versioning (`/api/v1`)
- Webhook handlers (Stripe, Supabase, Pusher)
- Background job processing

**Deployment:**
- Vercel Serverless Functions (for tRPC endpoints)
- Railway or Render (for long-running processes like queues)

---

### 2. Web (`apps/web`)

**Purpose**: Next.js web application for desktop/mobile browsers

**Stack:**
- **Framework**: Next.js 14+ (App Router)
- **UI**: React + TailwindCSS + shadcn/ui
- **State**: Zustand
- **Data Fetching**: Tanstack Query + tRPC client
- **Auth**: Supabase Auth SDK (custom UI)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Real-time**: Pusher JS client

**Key Features:**
- Server-side rendering (SSR)
- Static generation where possible
- Optimistic UI updates
- Progressive Web App (PWA) support
- Responsive design (mobile-first)
- Theme switching (light/dark)

**Deployment:**
- Vercel (Hobby tier)

---

### 3. Mobile (`apps/mobile`)

**Purpose**: React Native app for iOS and Android

**Stack:**
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **UI**: React Native Paper or NativeBase
- **State**: Zustand (shared with web)
- **Data Fetching**: Tanstack Query + tRPC client
- **Auth**: Supabase Auth SDK (custom UI)
- **Forms**: React Hook Form + Zod
- **Icons**: React Native Vector Icons
- **Real-time**: Pusher React Native client
- **Push Notifications**: Expo Notifications
- **Camera**: Expo Camera/Image Picker
- **Storage**: Expo SecureStore

**Key Features:**
- Native authentication flow
- Biometric login (Face ID/Touch ID)
- Push notifications
- Offline support (local storage)
- Camera integration for photos
- Native sharing
- Deep linking

**Deployment:**
- Expo EAS Build
- App Store (iOS)
- Google Play Store (Android)

---

### 4. Shared (`packages/`)

#### `packages/ui`

Shared UI components that work across web and mobile (where applicable)

**Contents:**
- Type definitions
- Validation schemas (Zod)
- Utility functions
- Constants
- API client configuration

**Stack:**
- TypeScript
- Zod for validation schemas
- Shared business logic

#### `packages/types`

Shared TypeScript types and interfaces

**Contents:**
- Database models
- API request/response types
- Enum definitions
- Utility types

#### `packages/config`

Shared configuration files

**Contents:**
- ESLint config
- TypeScript config
- Prettier config
- Tailwind config (for web)

#### `packages/utils`

Shared utility functions

**Contents:**
- Date formatting
- String manipulation
- Validation helpers
- Error handling

---

## Authentication Architecture

### Web Flow (Supabase + Next.js)

1. User signs in via custom UI (email/password or OAuth)
2. Supabase issues JWT token (stored in localStorage/cookies)
3. Next.js middleware validates token on each request
4. API calls include JWT in Authorization header
5. API validates JWT with Supabase public key
6. Row Level Security (RLS) enforces database-level permissions

### Mobile Flow (Supabase + Expo)

1. User signs in via custom UI (Supabase SDK)
2. Supabase issues JWT token (stored in SecureStore)
3. App includes JWT in Authorization header for all API calls
4. API validates JWT with Supabase public key
5. Token refresh handled automatically by Supabase SDK

### API Token Validation

```typescript
// apps/api/src/middleware/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function validateToken(token: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### Custom Auth UI Examples

```typescript
// Web: Email/Password Sign In
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Web: OAuth Sign In
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://peeps.app/auth/callback',
  },
});

// Mobile: Same API, different storage
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

---

## API Design

### tRPC Router Structure

```typescript
// apps/api/src/trpc/router.ts
import { router } from './trpc';
import { userRouter } from './routers/user';
import { peopleRouter } from './routers/people';
import { groupsRouter } from './routers/groups';
import { messagesRouter } from './routers/messages';
import { eventsRouter } from './routers/events';
import { albumsRouter } from './routers/albums';

export const appRouter = router({
  user: userRouter,
  people: peopleRouter,
  groups: groupsRouter,
  messages: messagesRouter,
  events: eventsRouter,
  albums: albumsRouter,
});

export type AppRouter = typeof appRouter;
```

### REST Endpoints (for webhooks and file uploads)

```
POST   /api/v1/webhooks/supabase
POST   /api/v1/webhooks/stripe
POST   /api/v1/upload/image
POST   /api/v1/upload/video
GET    /api/v1/health
```

---

## Data Flow

### Web Client → API

```
Web App (Next.js)
  ↓ tRPC Client
  ↓ JWT Token (Cookie)
  ↓
API Server (Express/tRPC)
  ↓ Validate JWT
  ↓ Process Request
  ↓
Database (PostgreSQL)
```

### Mobile Client → API

```
Mobile App (React Native)
  ↓ tRPC Client
  ↓ JWT Token (SecureStore)
  ↓
API Server (Express/tRPC)
  ↓ Validate JWT
  ↓ Process Request
  ↓
Database (PostgreSQL)
```

### Real-time Updates

```
Client (Web/Mobile)
  ↓ Subscribe to Pusher Channel
  ↓
API Server
  ↓ Publish Event to Pusher
  ↓
Pusher
  ↓ Broadcast to Subscribers
  ↓
Client (Web/Mobile)
  ↓ Update UI
```

---

## Database Strategy

### Single Database for All Clients

- PostgreSQL (Vercel Postgres or Neon)
- Accessed only by API server
- Never direct access from web/mobile
- Row-level security via API middleware

### Schema Sharing

```typescript
// packages/types/src/db.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // ... shared across all clients
}
```

---

## File Upload Strategy

### Web Upload Flow

1. User selects file in web UI
2. File uploaded directly to Cloudinary (unsigned upload)
3. Cloudinary returns URL
4. Web app sends URL to API
5. API stores URL in database

### Mobile Upload Flow

1. User captures photo or selects from gallery
2. Image compressed locally
3. Upload to Cloudinary via API endpoint
4. API returns URL and stores in database

---

## Real-time Strategy

### Pusher Channels

```typescript
// Channel naming convention
`user-${userId}`              // User-specific updates
`group-${groupId}`            // Group updates
`thread-${threadId}`          // Thread messages
`event-${eventId}`            // Event updates
```

### Event Types

```typescript
// packages/types/src/events.ts
export enum PusherEvent {
  MESSAGE_NEW    = 'MESSAGE_NEW',
  MESSAGE_EDIT   = 'MESSAGE_EDIT',
  MESSAGE_DELETE = 'MESSAGE_DELETE',
  TYPING_START   = 'TYPING_START',
  TYPING_STOP    = 'TYPING_STOP',
  USER_ONLINE    = 'USER_ONLINE',
  USER_OFFLINE   = 'USER_OFFLINE',
  EVENT_UPDATE   = 'EVENT_UPDATE',
  PHOTO_NEW      = 'PHOTO_NEW',
}
```

---

## Security Considerations

### API Security

- **Authentication**: JWT validation on all protected routes
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Per-user and per-IP limits
- **CORS**: Whitelist web and mobile origins
- **Input Validation**: Zod schemas on all inputs
- **SQL Injection**: Parameterized queries via Drizzle
- **XSS Prevention**: Sanitize user input
- **CSRF**: Not needed (JWT-based, no cookies on API)

### Mobile Security

- **Token Storage**: Expo SecureStore (encrypted)
- **Certificate Pinning**: For production API calls
- **Biometric Auth**: Optional Face ID/Touch ID
- **Jailbreak Detection**: Warn users on compromised devices
- **Code Obfuscation**: Minify and obfuscate production builds

### Web Security

- **Token Storage**: HTTP-only cookies or localStorage (Supabase SDK handles this)
- **CSP Headers**: Content Security Policy
- **HTTPS Only**: Force HTTPS in production
- **Secure Headers**: Helmet.js middleware

---

## Development Workflow

### Local Development

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm dev --filter=api
pnpm dev --filter=web
pnpm dev --filter=mobile

# Build all
pnpm build

# Lint all
pnpm lint

# Type check all
pnpm type-check
```

### Environment Variables

Each app has its own `.env.local`:

```
apps/api/.env.local
apps/web/.env.local
apps/mobile/.env.local
```

Shared environment variables in root `.env`:

```
DATABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Deployment Strategy

### API Deployment

**Option 1: Vercel Serverless (Recommended for MVP)**
- Deploy tRPC endpoints as serverless functions
- Automatic scaling
- Zero-cost for low traffic
- Limitation: 10s timeout on Hobby plan

**Option 2: Railway/Render (For background jobs)**
- Long-running Node.js server
- BullMQ queue processing
- WebSocket support
- $5-10/month

### Web Deployment

- **Vercel**: Automatic deployment on git push
- **Preview URLs**: For each PR
- **Edge Functions**: For dynamic routes
- **Static Generation**: For public pages

### Mobile Deployment

- **Expo EAS Build**: Cloud build service
- **Over-the-Air Updates**: Push updates without app store review
- **App Store**: Manual submission (iOS)
- **Google Play**: Manual submission (Android)

---

## Monorepo Setup with Turborepo

### Benefits

- **Shared Dependencies**: Install once, use everywhere
- **Incremental Builds**: Only rebuild what changed
- **Parallel Execution**: Run tasks across apps simultaneously
- **Caching**: Cache build outputs
- **Type Safety**: Shared types across all apps

### Turborepo Configuration

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    }
  }
}
```

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## Cost Breakdown (Zero-Cost MVP)

### Shared Services (used by all apps)
- **Database**: Vercel Postgres (free tier)
- **Auth**: Supabase Auth (unlimited users free)
- **Storage**: Cloudinary (25GB free)
- **Real-time**: Pusher (200k messages/day free)
- **Email**: Resend (3k emails/month free)
- **Redis**: Upstash (10k commands/day free)

### Per-App Costs
- **API**: Vercel Serverless (free on Hobby plan)
- **Web**: Vercel (free on Hobby plan)
- **Mobile**: Expo (free tier, $29/mo for EAS Build when needed)

### Total MVP Cost: $0-29/month
- $0 if using local builds for mobile
- $29 if using Expo EAS Build

---

## Migration Path from Current Plan

### Phase 1 Changes

Instead of starting with Next.js monolith:

1. **Week 1**: Set up monorepo structure
2. **Week 1**: Create API server with tRPC
3. **Week 2**: Create Next.js web app (client only)
4. **Week 2**: Set up shared packages
5. **Week 3**: Create React Native app shell
6. **Week 3**: Implement authentication across all three

### Parallel Development

- **API**: Build endpoints as needed
- **Web**: Consume API via tRPC
- **Mobile**: Consume same API via tRPC
- **Shared**: Extract common code as you go

---

## Testing Strategy

### API Testing
- **Unit**: Jest for business logic
- **Integration**: Supertest for endpoints
- **E2E**: Playwright for critical flows

### Web Testing
- **Unit**: Jest + React Testing Library
- **Integration**: Playwright
- **E2E**: Playwright

### Mobile Testing
- **Unit**: Jest + React Native Testing Library
- **E2E**: Detox or Maestro

### Shared Package Testing
- **Unit**: Jest for utilities and types

---

## Next Steps

1. Set up monorepo with Turborepo
2. Create API server with Express + tRPC
3. Set up database and Drizzle ORM
4. Implement authentication (Supabase Auth with custom UI)
5. Create web app shell
6. Create mobile app shell
7. Build shared packages
8. Implement first feature (user profile) across all platforms

---

## Questions to Consider

1. **Expo vs React Native CLI**: Expo is easier but less flexible. Recommendation: Start with Expo, eject if needed.
2. **API Hosting**: Vercel Serverless vs Railway. Recommendation: Start with Vercel, move to Railway if you need long-running processes.
3. **Shared UI Components**: Can we share components between web and mobile? Recommendation: Share types/logic only, separate UI components.
4. **Offline Support**: How much offline functionality does mobile need? Recommendation: Start online-only, add offline later.
5. **Push Notifications**: When to implement? Recommendation: Phase 4 (Messaging) for mobile.
