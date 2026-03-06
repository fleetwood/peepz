# Onboarding: Types Layer Changes

## Goal

Define shared, Zod-backed types for forms, API contracts, and UI state to ensure type safety and deduplicate definitions in `packages/types`. No dependencies.

## Dependencies

- None. This layer is implemented first and exported for all downstream layers.

## Types to add to `packages/types`

See `packages/types/src/onboarding.ts` for all Zod schemas and inferred types.

### OnboardingStep
```typescript
// packages/types/src/onboarding.ts
export const OnboardingStepSchema = z.enum([...])
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>
```

### JoinRequest
```typescript
// packages/types/src/onboarding.ts
export const JoinRequestStatusSchema = z.nativeEnum(RequestStatus)
export type JoinRequestStatus = z.infer<typeof JoinRequestStatusSchema>

export const JoinRequestRequirementsSchema = z.object({...})
export const JoinRequestConfirmationSchema = z.object({
  type: z.nativeEnum(GroupRole),
  ...
})
export const ClaimedRelationshipSchema = z.object({
  type: z.nativeEnum(RelationshipType),
  ...
})
export const JoinRequestSchema = z.object({...})
export type JoinRequest = z.infer<typeof JoinRequestSchema>
```

### Governance
```typescript
// packages/types/src/onboarding.ts
export const GovernanceModelSchema = z.nativeEnum(GovernanceModel)
export type GovernanceModel = z.infer<typeof GovernanceModelSchema>

export const GovernanceConfigSchema = z.record(z.unknown())
export type GovernanceConfig = z.infer<typeof GovernanceConfigSchema>

export const FamilyGovernanceSchema = z.object({...})
export type FamilyGovernance = z.infer<typeof FamilyGovernanceSchema>
```

### Form inputs
```typescript
// packages/types/src/onboarding.ts
export const CreateJoinRequestInputSchema = z.object({...})
export const ApproveRequestInputSchema = z.object({
  confirmationType: z.nativeEnum(GroupRole)
})
export const UpdateRelationshipsInputSchema = z.object({...})
```

### UI state
```typescript
// packages/types/src/onboarding.ts
export const OnboardingContextSchema = z.object({...})
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