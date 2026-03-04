import { z } from 'zod'
import {
  RequestStatus,
  GovernanceModel,
  RelationshipType,
  GroupRole
} from '@peeps/db'

export const OnboardingStepSchema = z.enum([
  'profile',
  'family-selection',
  'approval',
  'relationships',
  'governance',
  'complete'
])
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>

export const JoinRequestStatusSchema = z.nativeEnum(RequestStatus)
export type JoinRequestStatus = z.infer<typeof JoinRequestStatusSchema>

export const JoinRequestRequirementsSchema = z.object({
  adminsNeeded : z.number(),
  membersNeeded: z.number()
})

export const JoinRequestConfirmationSchema = z.object({
  memberId : z.string(),
  type     : z.nativeEnum(GroupRole),
  createdAt: z.string().datetime()
})

export const ClaimedRelationshipSchema = z.object({
  targetMemberId: z.string(),
  type          : z.nativeEnum(RelationshipType)
})
export type ClaimedRelationship = z.infer<typeof ClaimedRelationshipSchema>

export const JoinRequestSchema = z.object({
  id                  : z.string(),
  status              : JoinRequestStatusSchema,
  requirements        : JoinRequestRequirementsSchema,
  confirmations       : z.array(JoinRequestConfirmationSchema),
  claimedRelationships: z.array(ClaimedRelationshipSchema).optional(),
  expiresAt           : z.string().datetime().optional()
})
export type JoinRequest = z.infer<typeof JoinRequestSchema>

export const FamilyGovernanceSchema = z.object({
  model : z.nativeEnum(GovernanceModel),
  config: z.record(z.unknown()).optional()
})
export type FamilyGovernance = z.infer<typeof FamilyGovernanceSchema>

export const CreateJoinRequestInputSchema = z.object({
  familyId  : z.string(),
  inviteCode: z.string().optional()
})
export type CreateJoinRequestInput = z.infer<typeof CreateJoinRequestInputSchema>

export const ApproveRequestInputSchema = z.object({
  confirmationType: z.nativeEnum(GroupRole)
})
export type ApproveRequestInput = z.infer<typeof ApproveRequestInputSchema>

export const UpdateRelationshipsInputSchema = z.object({
  relationships: z.array(ClaimedRelationshipSchema)
})
export type UpdateRelationshipsInput = z.infer<typeof UpdateRelationshipsInputSchema>

export const OnboardingContextSchema = z.object({
  currentStep      : OnboardingStepSchema,
  selectedFamily   : z.any().optional(),                 // Family type from existing schema
  joinRequestId    : z.string().optional(),
  joinRequestStatus: JoinRequestStatusSchema.optional()
})
export type OnboardingContext = z.infer<typeof OnboardingContextSchema>
