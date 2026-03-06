# Onboarding: Client Layer Changes

## Goal

Provide thin, type-safe client abstractions that call API endpoints and expose a minimal onboarding state interface to the UI. Depends on **Types** and **API**.

## Dependencies

- **Types**: All input/output types from `packages/types`.
- **API**: Endpoints defined in the API layer.

## New/updated client modules

- **OnboardingService client**
  - Methods: `createJoinRequest`, `getJoinRequest`, `approveRequest`, `updateRelationships`
  - Handles HTTP errors and retries
  - Returns typed DTOs matching API contracts
- **FamilyService client**
  - Extend with `setGovernance`
  - Reuse existing `createFamily` and search methods
- **Realtime subscription helpers**
  - Subscribe to `family.approval.requested`, `family.approval.status.changed`, `relationship.confirmation.requested`
  - Provide callbacks or reactive stores

## State management (client-side)

- Keep **minimal** client state; source of truth is the DB
- Cache current join request id/status in local storage for session continuity
- Use a simple store or context for `currentStep` and selected family
- Re-fetch from API on state corruption or app wake

## Example client interface

```typescript
import {
  CreateJoinRequestInput,
  JoinRequest,
  ApproveRequestInput,
  UpdateRelationshipsInput,
  ClaimedRelationship,
  FamilyGovernance
} from '@peeps/types'

class OnboardingClient {
  async createJoinRequest(input: CreateJoinRequestInput): Promise<JoinRequest> {}
  async getJoinRequest(requestId: string): Promise<JoinRequest> {}
  async approveRequest(requestId: string, input: ApproveRequestInput): Promise<void> {}
  async updateRelationships(requestId: string, input: UpdateRelationshipsInput): Promise<void> {}
  subscribeToApprovalStatus(requestId: string, cb: (status: JoinRequest) => void): () => void
}

class FamilyClient {
  async setGovernance(familyId: string, governance: FamilyGovernance): Promise<void> {}
  // …existing methods
}
```

## Integration points

- **FamilySearch component**: call `OnboardingClient.createJoinRequest` on selection
- **Approval component**: poll `getJoinRequest` + subscribe to real-time events
- **Relationships component**: call `updateRelationships` on submit
- **Family/Governance component**: call `FamilyClient.setGovernance`

## Error handling UX

- Show human-friendly messages for 400/403/404/409/410
- Retry on transient network errors with backoff
- Clear cached join request on auth failure
- Graceful degradation if WebSocket is unavailable (fallback to polling)

## Performance considerations

- Debounce rapid relationship updates
- Cache family member search results locally
- Lazy-load governance options
- Minimal re-renders via stable callbacks