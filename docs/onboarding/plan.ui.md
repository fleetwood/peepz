# Onboarding: UI Layer Changes

## Goal

Implement the multi-session onboarding screens and wire them to the client/API layer with clear step progression and real-time feedback. Depends on **Types**, **Services**, **API**, and **Clients**.

## Dependencies

- **Types**: `OnboardingContext`, `JoinRequest`, `ClaimedRelationship`, `GovernanceModel`, `FamilyGovernance`.
- **Clients**: `OnboardingClient` and `FamilyClient` methods.

## New/updated components

- **FamilySearch**
  - Connect `handleSelectFamily` to `OnboardingClient.createJoinRequest`
  - Show approval requirements immediately after request submission
  - Support invite code entry
- **Approval**
  - Display current status and who still needs to approve
  - Real-time updates via WebSocket subscription for present admins
  - Show persisted Notifications for admins who were offline
  - “Notify admins” button for expiration reminders (optional)
- **Relationships** (new)
  - Search family members
  - Declare relationship type using `ClaimedRelationship.type` enum
  - Show pending confirmation status from `JoinRequest.claimedRelationships`
  - Submit via `OnboardingClient.updateRelationships(UpdateRelationshipsInput)`
- **Family/Governance**
  - Governance model selector using `GovernanceModel` enum
  - Initial admin assignment
  - Succession planning UI
  - Save via `FamilyClient.setGovernance(FamilyGovernance)`
- **OnboardingFlow wrapper**
  - Tab/step indicator
  - Persist `currentStep` in context/localStorage
  - Guard navigation based on join request status

## Screen flow

1. **Profile** (already exists)
2. **FamilySearch** → submit join request → show approval requirements
3. **Approval** → poll/subscribe → advance when approved
4. **Relationships** → map relationships → submit
5. **Governance** (only for new families or admins) → configure → complete
6. **Complete** → redirect to family home

## State to expose via context

```typescript
import { OnboardingContext, JoinRequest, JoinRequestStatus } from '@peeps/types'

// Use OnboardingContext directly from packages/types
```

## Real-time UI updates

- Subscribe to `family.approval.status.changed` in Approval component
- Update UI instantly when an admin approves
- Show toast/banner for status changes
- Fallback to polling every 5–10 seconds if WebSocket unavailable

## Accessibility

- Screen reader support for all forms
- Keyboard navigation between steps
- High contrast mode support
- Clear error messages and progress indication

## Edge cases

- **Multiple families**: allow repeating flow; show list of in-progress families
- **Rejected request**: prompt to try another family or create new
- **Expired request**: clear state and restart from family search
- **Minor users**: parent/guardian approval flow (future enhancement)