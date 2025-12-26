# Packages

This doc describes the purpose and boundaries of each workspace package.

## `@peeps/config`

- Centralized configuration
- Environment variables:
  - `clientEnv` for browser-safe values
  - `serverEnv` for server-only secrets

## `@peeps/db`

- Drizzle schema + DB client
- Server-only

## `@peeps/services`

- Business logic
- Calls `@peeps/db`
- No HTTP logic

## `@peeps/client`

- Client-side QueryManager + shared hooks
- Used by both web and mobile

## `@peeps/types`

- Shared types and enums
- No framework-specific imports

## `@peeps/utils`

- Shared utilities (logger, string helpers, etc.)
