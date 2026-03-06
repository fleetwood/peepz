# API Layer

The API Layer defines the server-side boundary that clients call.

## Source of Truth

- `apps/api/app/api/`

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
// apps/api/app/api/persons/route.ts
// (Pseudo example)

// 1. Validate input
// 2. Validate authentication/session (Member context)
// 3. Call PersonService
// 4. Return JSON response
```

## TODO: API Key + Mobile Attestation Security

- We discussed using an `x-peeps-api-key` header as a security gate so a bad actor can’t call our API.
- Key conclusion: a secret API key in a browser (website) is not a meaningful security boundary because it can be extracted from the JS bundle / DevTools and replayed.

### Deferred plan (selected direction)

- Standard server-to-server API key model:
  - Key format: `keyId.secret` presented via header (e.g. `x-peeps-api-key: <keyId>.<secret>`)
  - Store only: `keyId`, `secretHash`, metadata (scopes, owner, createdAt, lastUsedAt, revokedAt)
  - Verify per request: lookup by `keyId`, hash provided secret, compare, enforce scopes/revocation
  - Support rotation + revocation

- Mobile attestation for “only our app can call the API”:
  - iOS: App Attest (or DeviceCheck)
  - Android: Play Integrity
  - Pattern: mobile performs attestation, server verifies, server issues short-lived attestation token (JWT), token required for mobile calls
  

### Open questions for later

- Do we require attestation for:
  - Mobile only (recommended)
  - Or any other clients?
- Which endpoints are gated by server-to-server API keys (internal-only) vs gated by user auth (Supabase bearer token)?
