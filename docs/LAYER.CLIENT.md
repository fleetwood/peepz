# Client Layer

The Client Layer is responsible for client-side data fetching, caching, invalidation, and request orchestration.

## Source of Truth

- `packages/client`

## Responsibilities

- Call the API layer (REST routes)
- Cache results (TanStack Query)
- Handle invalidation patterns
- Provide shared hooks usable by both web and mobile

## Rules

- Clients MUST NOT call services directly.
- Clients MUST NOT access the database.
- Clients SHOULD use QueryManager for consistent caching and invalidation.

## Typical Data Flow

```text
UI (apps/web or apps/mobile)
  -> Client hooks (packages/client)
    -> fetch calls (apps/web/app/api)
      -> Service layer (packages/services)
        -> DB layer (packages/db)
```
