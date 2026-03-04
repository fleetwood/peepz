# Onboarding: Types Layer Changes

## Goal

Define shared, Zod-backed types for forms, API contracts, and UI state to ensure type safety and deduplicate definitions in `packages/types`. No dependencies.

## Dependencies

- None. This layer is implemented first and exported for all downstream layers.

## Types to add to `packages/types`

### OnboardingStep
```typescript
export const OnboardingStepSchema = z.enum([
  'profile',
  'family-selection',
  'approval',
  'relationships',
  'governance',
  'complete'
])
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>
```

### JoinRequest
```typescript
export const JoinRequestStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED'])
export type JoinRequestStatus        = z.infer<typeof JoinRequestStatusSchema>

export const JoinRequestRequirementsSchema = z.object({
  adminsNeeded : z.number(),
  membersNeeded: z.number()
})

export const JoinRequestConfirmationSchema = z.object({
  memberId : z.string(),
  type     : z.enum(['ADMIN', 'MEMBER']),
  createdAt: z.string().datetime()
})

export const ClaimedRelationshipSchema = z.object({
  targetMemberId: z.string(),
  type          : z.enum(['PARENT', 'CHILD', 'SIBLING', 'SPOUSE', 'PARTNER'])
})

export const JoinRequestSchema = z.object({
  id                  : z.string(),
  status              : JoinRequestStatusSchema,
  requirements        : JoinRequestRequirementsSchema,
  confirmations       : z.array(JoinRequestConfirmationSchema),
  claimedRelationships: z.array(ClaimedRelationshipSchema).optional(),
  expiresAt           : z.string().datetime().optional()
})
export type JoinRequest = z.infer<typeof JoinRequestSchema>
```

### Governance
```typescript
export const GovernanceModelSchema = z.enum([
  'SINGLE_ADMIN',
  'HIERARCHICAL',
  'CONSENSUS',
  'DEMOCRATIC'
])
export type GovernanceModel = z.infer<typeof GovernanceModelSchema>

export const GovernanceConfigSchema = z.record(z.unknown())
export type GovernanceConfig        = z.infer<typeof GovernanceConfigSchema>

export const FamilyGovernanceSchema = z.object({
  model : GovernanceModelSchema,
  config: GovernanceConfigSchema.optional()
})
export type FamilyGovernance = z.infer<typeof FamilyGovernanceSchema>
```

### Form inputs
```typescript
export const CreateJoinRequestInputSchema = z.object({
  familyId  : z.string(),
  inviteCode: z.string().optional()
})
export type CreateJoinRequestInput = z.infer<typeof CreateJoinRequestInputSchema>

export const ApproveRequestInputSchema = z.object({
  confirmationType: z.enum(['ADMIN', 'MEMBER'])
})
export type ApproveRequestInput = z.infer<typeof ApproveRequestInputSchema>

export const UpdateRelationshipsInputSchema = z.object({
  relationships: z.array(ClaimedRelationshipSchema)
})
export type UpdateRelationshipsInput = z.infer<typeof UpdateRelationshipsInputSchema>
```

### UI state
```typescript
export const OnboardingContextSchema = z.object({
  currentStep      : OnboardingStepSchema,
  selectedFamily   : z.any().optional(),                 // Family type from existing schema
  joinRequestId    : z.string().optional(),
  joinRequestStatus: JoinRequestStatusSchema.optional()
})
export type OnboardingContext = z.infer<typeof OnboardingContextSchema>
```

## Database schema additions

### members table
- `currentStep` (OnboardingStep) – track coarse progress

### groups table
- `governanceModel` (GovernanceModel)
- `governanceConfig` (JSON) – per-model settings

## Validation helpers

Export Zod schemas for: 
- API request/response validation
- Form validation on the client
- Runtime validation at service boundaries

## Usage

- Import from `packages/types` in API, client, and UI layers
- Use Zod schemas for request/response validation in API routes
- Use inferred types for component props and context
- Ensure single source of truth for all onboarding-related types