# API Layer

The API Layer defines the server-side boundary that clients call.

## Source of Truth

- `apps/web/app/api/`

## Responsibilities

- Validate input (Zod)
- Validate authentication/session (Member context)
- Authorize access (privacy + membership rules)
- Call the service layer (`@peeps/services`)
- Return responses (no business logic in routes)

## Rules

- Routes MUST NOT contain business logic.
- Routes MUST NOT directly access the database.
- Routes MUST call services.

## Typical Handler Shape

```typescript
// apps/web/app/api/persons/route.ts
// (Pseudo example)

// 1. Validate input
// 2. Validate authentication/session (Member context)
// 3. Call PersonService
// 4. Return JSON response
```
