# Onboarding: Service Layer Changes

## Goal

Make the server-side **source of truth** for onboarding progress by using existing persistence. Depends on **Types** layer.

## Dependencies

- **Types**: `OnboardingStep`, `JoinRequest`, `ClaimedRelationship`, `FamilyGovernance`, and all Zod schemas from `packages/types`.

- **`familyJoinRequests`** as the join/approval/relationship workflow record and primary onboarding state

## Services to add or extend

- **FamilyJoinRequest service**
  - Create a join request for a member + family
  - Read request state (status, confirmations, requirements)
  - Update `claimedRelationships`
  - Record confirmations / approvals
  - Enforce "1 admin OR 2 non-admin" rule
- **Family/Group governance service**
  - Persist governance model + config for new families and/or admins

## Required service operations

- **Create join request**
  - Inputs: `memberId`, `familyId` (or groupId), optional `inviteCode`
  - Output: `JoinRequest` (from `packages/types`)
  - Side effects: none (status is tracked in `familyJoinRequests`)
- **Get join request**
  - Inputs: request id (and/or lookup by `(memberId, familyId)`)
  - Output: `JoinRequest` (includes confirmations, requirements, claimedRelationships)
- **Approve / confirm join request**
  - Inputs: `requestId`, `actorMemberId`, `confirmationType: 'ADMIN' | 'MEMBER'`
  - Behavior: write a confirmation, recompute status, finalize membership when satisfied
  - Side effects: none (status is tracked in `familyJoinRequests`)
- **Update claimed relationships**
  - Inputs: `requestId`, `relationships: ClaimedRelationship[]`
  - Behavior: validate member targets are in-family, store into `familyJoinRequests.claimedRelationships`
- **Set family governance**
  - Inputs: `familyId`, `governance: FamilyGovernance`
  - Behavior: persist `governanceModel` and `governanceConfig` on the group record

## Validation + invariants

- **Single active request** per `(memberId, familyId)` unless prior is `REJECTED`/expired
- **Authorization**: only the requesting member (and relevant admins) can read/update the request
- **Idempotency**: repeated approvals from same actor shouldn't duplicate confirmations
- **Expiration**: respect `expiresAt` (if present) and surface a clear "expired" state

## Events the service should emit

- `family.approval.requested` – for real-time updates to present admins
- `family.approval.status.changed` – when any approval is recorded
- `relationship.confirmation.requested` – when relationships are declared

## Notifications

- When a join request is created, automatically create a `Notification` record for all family admins who are not currently online/present.
- If an admin is present (WebSocket connected), rely on the socket emit for real-time updates.
- Optional: Send an expiration-reminder notification if a request is nearing `expiresAt` and still pending (can be triggered by a “Notify admins” button or a scheduled job).