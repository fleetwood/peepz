# Family Onboarding Experience Plan

## Core Principles from Business Rules

- **Bot Prevention**: Family verification requires 1 admin OR 2 non-admin members
- **Family Autonomy**: Each family chooses governance model (Single Admin, Hierarchical, Consensus, Democratic)
- **Multi-Family Support**: Users can belong to multiple families
- **Privacy-First**: No public profiles, closed system
- **Child Safety**: Auto-detect minors (<18) with enhanced protections

## Current State Analysis

- ✅ **Profile**: Complete form with smart state management
- ✅ **Family Search**: Functional search + create new family option
- ⚠️ **Approval**: UI exists but no backend integration
- ⚠️ **Family**: Empty component
- ⚠️ **Flow**: No state management between tabs

## Proposed Multi-Session Flow

### Session 1: Identity & Family Selection

1. **Profile Setup** (already complete)
2. **Family Discovery** 
   - Search existing families
   - Enter invite code
   - Create new family
3. **Initial Join Request**
   - Submit membership request
   - Show approval requirements

### Session 2: Approval & Relationships (if needed)

4. **Approval Status**
   - Pending: Show who needs to approve
   - Approved: Continue to relationships
5. **Relationship Mapping**
   - Declare relationships to specific family members
   - Create pending person-to-person edges

### Session 3: Family Setup (for new families or admins)

6. **Governance Selection**
   - Choose family governance model
   - Set initial admins
7. **Family Configuration**
   - Privacy settings
   - Admin succession planning

## State Management Architecture

### Onboarding State Object

```typescript
type OnboardingState = {
  currentStep    : 'profile' | 'family-selection' | 'approval' | 'relationships' | 'governance' | 'complete'
  selectedFamily?: Family
  profile        : ProfileData
  relationships  : PendingRelationship[]
  governance    ?: GovernanceConfig
}
```

### Multi-Session Persistence

**Leverage existing database schema:**

- Use `familyJoinRequests` table as primary onboarding state for joining families
- Add `currentStep` field to `members` table for progress tracking
- Store profile data in `members` table
- Store relationships in `familyJoinRequests.claimedRelationships`
- Track approvals in `familyJoinRequests.confirmations` and `status`

**Benefits:**
- Cross-device continuity
- Server-side validation and flow enforcement
- Data integrity and security
- Admin visibility into stuck onboarding states
- Analytics on drop-off points
- Leverages existing request/confirmation infrastructure

## Component Enhancements Needed

### 1. FamilySearch Integration

- Connect `handleSelectFamily` to backend
- Create join request API call
- Store selected family in onboarding state

### 2. Approval Component

- Show approval status and requirements
- Display who needs to approve (admins vs members)
- Real-time updates via WebSocket
- "Notify admins" functionality

### 3. Family Component

- Governance model selection
- Admin setup and succession
- Family settings configuration
- Only show for family creators or admins

### 4. New: Relationships Component

- Search family members
- Declare relationship type (parent/child/sibling/spouse/partner)
- Create pending relationship edges
- Show confirmation status

## API Integration Points

### Required Endpoints

- `POST /onboarding/profile` - Update member profile (already exists)
- `POST /families/join-requests` - Create FamilyJoinRequest record
- `GET /families/join-requests/:requestId` - Check FamilyJoinRequest status
- `PUT /families/join-requests/:requestId/relationships` - Update claimedRelationships
- `POST /families/join-requests/:requestId/approve` - Submit approval (for admins/members)
- `POST /families` - Create new family (already exists)
- `PUT /families/:id/governance` - Set family governance (new)

### Database Schema Usage

**Leverage existing tables:**
- `members` - Store profile data and currentStep progress
- `familyJoinRequests` - Core onboarding state for joining families
- `groups` - Family data and governance settings
- `requestStatusEnum` - PENDING/APPROVED/REJECTED states

**Schema additions needed:**
- `members.currentStep` - Track onboarding progress
- `groups.governanceModel` - Store family governance choice
- `groups.governanceConfig` - Store governance-specific settings

### WebSocket Events

- `family.approval.requested` - Notify admins
- `family.approval.status.changed` - Real-time updates
- `relationship.confirmation.requested` - Relationship confirmations

## User Experience Flow

### New User Journey

1. Complete profile
2. Search/select family → Submit request
3. **Session Break** (email notification to admins)
4. Return: Check approval status
5. If approved: Declare relationships
6. If creating family: Set governance
7. Complete: Access family content

### Edge Cases

- **Multiple families**: Repeat flow for each family
- **Rejected requests**: Try different family or create new
- **Minor users**: Parent/guardian approval flow
- **Admin succession**: Prompt for successor designation

## Implementation Order

**Strict sequence: Types → Services → API → Clients → UI**

1. **Types** (`packages/types`)
   - Add shared Zod schemas and inferred types
   - Export for downstream layers

2. **Services**
   - Implement FamilyJoinRequest, Member, and Governance services
   - Use shared types for inputs/outputs and validation

3. **API (actions/routes)**
   - Add endpoints that call service methods
   - Validate requests/responses with shared schemas
   - Enforce authorization rules

4. **Clients**
   - Add thin client methods that call API endpoints
   - Use shared types for payloads and responses
   - Add real-time subscription helpers

5. **UI**
   - Wire components to client methods
   - Use shared types for props and context
   - Add real-time UI updates

## Implementation Priority

### Phase 1: Core Flow
1. Types
2. Services: join request creation, status, approvals
3. API: join-request endpoints
4. Client: OnboardingClient methods
5. UI: FamilySearch, Approval, Relationships

### Phase 2: Governance
1. Types: GovernanceModel, FamilyGovernance
2. Services: governance persistence
3. API: PUT /families/:id/governance
4. Client: FamilyClient.setGovernance
5. UI: Governance selector and admin setup

### Phase 3: Polish
1. Services: emit WebSocket events
2. API: ensure events are broadcast
3. Client: subscription helpers
4. UI: real-time updates, notifications, multi-family UX

## Technical Considerations

### State Management

- **Database-first**: Use `familyJoinRequests` as source of truth
- **Client caching**: Minimal client-side state for performance
- **Real-time sync**: WebSocket updates for approval status changes
- **Error recovery**: Re-fetch from DB on client-side state corruption

### Error Handling

- Network failures during join requests
- Request expiration handling (expiresAt field)
- Invalid governance configurations
- Relationship conflicts and validation
- Concurrent approval scenarios

### Database Considerations

- **Indexing**: Ensure fast lookups on (memberId, groupId) for onboarding queries
- **Cleanup**: Archive old expired requests for performance
- **Constraints**: Validate governance models and relationship types
- **Transactions**: Ensure atomic updates for approval confirmations

### Accessibility

- Screen reader support for all forms
- Keyboard navigation
- High contrast mode support
- Error message clarity
- Progress indication for multi-step flows

### Performance

- Debounced search queries
- Lazy load family search results
- Optimize WebSocket connections
- Database query optimization for onboarding status checks
- Minimal re-renders during state updates