# Peeps Monorepo Setup Guide

## Initial Setup

### Step 1: Create Monorepo Structure

```bash
mkdir peeps
cd peeps
pnpm init
```

### Step 2: Install Turborepo

```bash
pnpm add -D turbo
```

### Step 3: Create Workspace Configuration

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Step 4: Create Directory Structure

```bash
mkdir -p apps/api apps/web apps/mobile
mkdir -p packages/ui packages/types packages/config packages/utils
```

---

## Root Configuration

### `package.json`

```json
{
  "name": "peeps-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\""
  },
  "devDependencies": {
    "turbo": "^1.11.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.12.0"
}
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### `.gitignore`

```
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/

# Production
build
dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# Turbo
.turbo

# React Native
.expo
.expo-shared

# IDE
.vscode
.idea
*.swp
*.swo
*~
```

---

## Package: Config (`packages/config`)

### `package.json`

```json
{
  "name": "@peeps/config",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "files": ["eslint-preset.js", "tsconfig.json"]
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### `eslint-preset.js`

```javascript
module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
};
```

---

## Package: Types (`packages/types`)

### `package.json`

```json
{
  "name": "@peeps/types",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@peeps/config": "workspace:*",
    "typescript": "^5.3.0"
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "@peeps/config/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `src/index.ts`

```typescript
export * from './user';
export * from './person';
export * from './group';
export * from './message';
export * from './event';
export * from './album';
export * from './enums';
```

### `src/enums.ts`

**See [model.md](./model.md#enums) for all enum definitions.**

All enums follow the coding standard: uppercase keys with matching uppercase values.

Example:
```typescript
export enum PrivacyLevel {
  PUBLIC  = 'PUBLIC',
  FAMILY  = 'FAMILY',
  PRIVATE = 'PRIVATE',
}
```

### `src/user.ts`

```typescript
import { PrivacyLevel } from './enums';

export interface User {
  id            : string;
  email         : string;
  firstName     : string;
  middleName   ?: string;
  lastName      : string;
  preferredName?: string;
  dateOfBirth   : Date;
  isMinor       : boolean;
  privacyLevel  : PrivacyLevel;
  createdAt     : Date;
  updatedAt     : Date;
  visible       : boolean;
}
```

---

## Package: Utils (`packages/utils`)

### `package.json`

```json
{
  "name": "@peeps/utils",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@peeps/types": "workspace:*"
  },
  "devDependencies": {
    "@peeps/config": "workspace:*",
    "typescript": "^5.3.0"
  }
}
```

### `src/index.ts`

```typescript
export * from './date';
export * from './string';
export * from './validation';
```

### `src/date.ts`

```typescript
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function isMinor(dateOfBirth: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    return age - 1 < 18;
  }
  
  return age < 18;
}
```

---

## App: API (`apps/api`)

### `package.json`

```json
{
  "name": "@peeps/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@peeps/types": "workspace:*",
    "@peeps/utils": "workspace:*",
    "@trpc/server": "^10.45.0",
    "@clerk/clerk-sdk-node": "^4.13.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.3",
    "zod": "^3.22.4",
    "dotenv": "^16.3.1",
    "pusher": "^5.2.0",
    "cloudinary": "^1.41.0",
    "resend": "^2.1.0",
    "stripe": "^14.9.0",
    "ioredis": "^5.3.2",
    "bullmq": "^5.1.0"
  },
  "devDependencies": {
    "@peeps/config": "workspace:*",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "drizzle-kit": "^0.20.0",
    "eslint": "^8.55.0"
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "@peeps/config/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `.env.example`

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Pusher
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="..."

# Resend
RESEND_API_KEY="re_..."

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
PORT=3001
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:3000,exp://192.168.1.1:8081"
```

---

## App: Web (`apps/web`)

### `package.json`

```json
{
  "name": "@peeps/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@peeps/types": "workspace:*",
    "@peeps/utils": "workspace:*",
    "@trpc/client": "^10.45.0",
    "@trpc/react-query": "^10.45.0",
    "@tanstack/react-query": "^5.14.0",
    "@clerk/nextjs": "^4.29.0",
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "zustand": "^4.4.7",
    "pusher-js": "^8.4.0-rc2",
    "lucide-react": "^0.294.0",
    "next-cloudinary": "^5.11.0",
    "tailwindcss": "^3.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "@peeps/config": "workspace:*",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
    "typescript": "^5.3.0",
    "eslint": "^8.55.0",
    "eslint-config-next": "14.0.4",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### `.env.local.example`

```bash
# API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."

# Pusher
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## App: Mobile (`apps/mobile`)

### `package.json`

```json
{
  "name": "@peeps/mobile",
  "version": "1.0.0",
  "private": true,
  "main": "expo-router",
  "scripts": {
    "dev": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "@peeps/types": "workspace:*",
    "@peeps/utils": "workspace:*",
    "@trpc/client": "^10.45.0",
    "@trpc/react-query": "^10.45.0",
    "@tanstack/react-query": "^5.14.0",
    "@clerk/clerk-expo": "^0.19.0",
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "zustand": "^4.4.7",
    "pusher-js": "^8.4.0-rc2",
    "expo-secure-store": "~12.8.0",
    "expo-image-picker": "~14.7.0",
    "expo-camera": "~14.1.0",
    "expo-notifications": "~0.27.0"
  },
  "devDependencies": {
    "@peeps/config": "workspace:*",
    "@babel/core": "^7.23.5",
    "@types/react": "~18.2.45",
    "typescript": "^5.3.0",
    "eslint": "^8.55.0"
  }
}
```

### `.env.example`

```bash
# API
EXPO_PUBLIC_API_URL="http://localhost:3001"

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Pusher
EXPO_PUBLIC_PUSHER_KEY="..."
EXPO_PUBLIC_PUSHER_CLUSTER="..."
```

---

## Installation Steps

### 1. Install Root Dependencies

```bash
cd peeps
pnpm install
```

### 2. Set Up Each Package

```bash
# Config package (no install needed, just configs)
cd packages/config

# Types package
cd packages/types
pnpm install

# Utils package
cd packages/utils
pnpm install

# API app
cd apps/api
cp .env.example .env.local
pnpm install

# Web app
cd apps/web
cp .env.local.example .env.local
pnpm install
pnpm dlx shadcn-ui@latest init

# Mobile app
cd apps/mobile
cp .env.example .env
pnpm install
```

### 3. Build Shared Packages

```bash
# From root
pnpm --filter @peeps/types build
pnpm --filter @peeps/utils build
```

### 4. Start Development

```bash
# From root - starts all apps
pnpm dev

# Or start individually
pnpm --filter @peeps/api dev
pnpm --filter @peeps/web dev
pnpm --filter @peeps/mobile dev
```

---

## Verification

After setup, verify each app:

### API
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

### Web
```bash
# Open browser to http://localhost:3000
```

### Mobile
```bash
# Scan QR code with Expo Go app
```

---

## Next Steps

1. Set up database schema in `apps/api/src/db/schema.ts`
2. Create tRPC routers in `apps/api/src/trpc/routers/`
3. Build web UI components
4. Build mobile screens
5. Implement authentication flow across all apps
6. Connect to external services (Clerk, Cloudinary, etc.)

---

## Troubleshooting

### Workspace Dependencies Not Found

```bash
# Rebuild all packages
pnpm --filter @peeps/types build
pnpm --filter @peeps/utils build
```

### Port Conflicts

- API: Change `PORT` in `apps/api/.env.local`
- Web: Use `next dev -p 3001`
- Mobile: Expo will auto-assign port

### Type Errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Expo Issues

```bash
cd apps/mobile
npx expo start --clear
```
