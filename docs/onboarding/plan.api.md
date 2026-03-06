# Onboarding: API Layer Changes

## Goal

Expose HTTP endpoints that map to the service operations and enforce the multi-session onboarding flow. Depends on **Types** and **Services**.

## Dependencies

- **Types**: All request/response schemas from `packages/types`.
- **Services**: FamilyJoinRequest, Member, and Governance services.

## New/updated endpoints

- `POST /families/join-requests`
  - Create a FamilyJoinRequest for a member joining a family
  - Body: `{ familyId, inviteCode? }`
  - Returns: join request with id, status, approval requirements
- `GET /families/join-requests/:requestId`
  - Fetch current status and confirmations
  - Returns: status, confirmations, who still needs to approve
- `PUT /families/join-requests/:requestId/relationships`
  - Update claimedRelationships
  - Body: `{ relationships: [{ targetMemberId, type }] }`
- `POST /families/join-requests/:requestId/approve`
  - Submit an approval/confirmation
  - Body: `{ confirmationType }`
  - Auth: must be admin or member in the family
- `PUT /families/:id/governance`
  - Set governance model and config
  - Body: `{ governanceModel, governanceConfig? }`
  - Auth: family creator or admin

## Existing endpoints to reuse

- `POST /onboarding/profile` - Update member profile (already exists)
- `POST /families` - Create new family (already exists)

## Request/response contracts

All contracts use types from `packages/types`. Validate request bodies with the corresponding Zod schemas.

### Create join request
```typescript
POST /families/join-requests
Body: CreateJoinRequestInput
→ JoinRequest
```

### Get join request
```typescript
GET /families/join-requests/:requestId
→ JoinRequest
```

### Approve
```typescript
POST /families/join-requests/:requestId/approve
Body: ApproveRequestInput
→ { status: JoinRequestStatus }
```

### Update relationships
```typescript
PUT /families/join-requests/:requestId/relationships
Body: UpdateRelationshipsInput
→ { claimedRelationships: ClaimedRelationship[] }
```

### Set governance
```typescript
PUT /families/:id/governance
Body: FamilyGovernance
→ { governance: FamilyGovernance }
```

## Authorization rules

- **Create**: any authenticated member
- **Read**: requesting member + family admins
- **Approve**: family admins (any) + family members (non-admin)
- **Update relationships**: requesting member only
- **Set governance**: family creator or admins

## Error handling

- 400: Invalid familyId, duplicate active request, malformed relationships
- 401/403: Unauthorized to approve or read
- 404: Request not found or expired
- 409: Conflict (duplicate request, invalid governance config)
- 410: Request expired

## Rate limiting / safety

- Limit join requests per member per hour
- Prevent approval spam: one confirmation per actor per request
- Validate relationship targets are in-family
- Enforce expiration logic