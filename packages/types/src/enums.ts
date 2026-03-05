import { z } from 'zod'

// =============================================================================
// Privacy
// =============================================================================

export const PrivacyLevel = {
  PUBLIC : 'PUBLIC',
  FAMILY : 'FAMILY',
  PRIVATE: 'PRIVATE',
} as const

export const PrivacyLevelSchema = z.nativeEnum(PrivacyLevel)
export type PrivacyLevelType = z.infer<typeof PrivacyLevelSchema>

// =============================================================================
// Family
// =============================================================================

export const FamilyNameCategory = {
  paternal : 'paternal',
  maternal : 'maternal',
  adopted  : 'adopted',
  surrogate: 'surrogate',
  chosen   : 'chosen',
  other    : 'other',
} as const

export const FamilyNameCategorySchema = z.nativeEnum(FamilyNameCategory)
export type FamilyNameCategoryType = z.infer<typeof FamilyNameCategorySchema>

// =============================================================================
// Groups
// =============================================================================

export const GroupType = {
  FAMILY : 'FAMILY',
  FRIENDS: 'FRIENDS',
  CLUB   : 'CLUB',
  OTHER  : 'OTHER',
} as const

export const GroupTypeSchema = z.nativeEnum(GroupType)
export type GroupTypeEnum = z.infer<typeof GroupTypeSchema>

export const GroupPrivacyLevel = {
  PRIVATE: 'PRIVATE',
  PUBLIC : 'PUBLIC',
  APPROVAL: 'APPROVAL',
} as const

export const GroupPrivacyLevelSchema = z.nativeEnum(GroupPrivacyLevel)
export type GroupPrivacyLevelEnum = z.infer<typeof GroupPrivacyLevelSchema>

export const GovernanceModel = {
  SINGLE_ADMIN: 'SINGLE_ADMIN',
  HIERARCHICAL: 'HIERARCHICAL',
  CONSENSUS   : 'CONSENSUS',
  DEMOCRATIC  : 'DEMOCRATIC',
} as const

export const GovernanceModelSchema = z.nativeEnum(GovernanceModel)
export type GovernanceModelEnum = z.infer<typeof GovernanceModelSchema>

export const RemovalPolicy = {
  IMMEDIATE         : 'IMMEDIATE',
  VOTE_REQUIRED     : 'VOTE_REQUIRED',
  CONSENSUS_REQUIRED: 'CONSENSUS_REQUIRED',
} as const

export const RemovalPolicySchema = z.nativeEnum(RemovalPolicy)
export type RemovalPolicyEnum = z.infer<typeof RemovalPolicySchema>

export const GroupRole = {
  ADMIN : 'ADMIN',
  MEMBER: 'MEMBER',
} as const

export const GroupRoleSchema = z.nativeEnum(GroupRole)
export type GroupRoleEnum = z.infer<typeof GroupRoleSchema>

export const MembershipStatus = {
  ACTIVE : 'ACTIVE',
  INVITED: 'INVITED',
  REMOVED: 'REMOVED',
} as const

export const MembershipStatusSchema = z.nativeEnum(MembershipStatus)
export type MembershipStatusEnum = z.infer<typeof MembershipStatusSchema>

// =============================================================================
// Entities
// =============================================================================

export const EntityType = {
  PERSON        : 'PERSON',
  MEMBER        : 'MEMBER',
  GROUP         : 'GROUP',
  FAMILY        : 'FAMILY',
  RELATIONSHIP  : 'RELATIONSHIP',
  THREAD        : 'THREAD',
  MESSAGE       : 'MESSAGE',
  ALBUM         : 'ALBUM',
  MEDIA         : 'MEDIA',
  EVENT         : 'EVENT',
  TAG           : 'TAG',
  BLOCK         : 'BLOCK',
  CONTENT_REPORT: 'CONTENT_REPORT',
  REMOVAL_REQUEST: 'REMOVAL_REQUEST',
  CONTACT_POINT : 'CONTACT_POINT',
  CONTACT_HANDLE: 'CONTACT_HANDLE',
} as const

export const EntityTypeSchema = z.nativeEnum(EntityType)
export type EntityTypeEnum = z.infer<typeof EntityTypeSchema>

// =============================================================================
// Media & Content
// =============================================================================

export const MediaType = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
} as const

export const MediaTypeSchema = z.nativeEnum(MediaType)
export type MediaTypeEnum = z.infer<typeof MediaTypeSchema>

export const TagStatus = {
  PENDING : 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const TagStatusSchema = z.nativeEnum(TagStatus)
export type TagStatusEnum = z.infer<typeof TagStatusSchema>

// =============================================================================
// Moderation
// =============================================================================

export const BlockType = {
  BLOCK: 'BLOCK',
  MUTE : 'MUTE',
} as const

export const BlockTypeSchema = z.nativeEnum(BlockType)
export type BlockTypeEnum = z.infer<typeof BlockTypeSchema>

export const ReportReason = {
  SPAM         : 'SPAM',
  INAPPROPRIATE: 'INAPPROPRIATE',
  HARASSMENT   : 'HARASSMENT',
  OTHER        : 'OTHER',
} as const

export const ReportReasonSchema = z.nativeEnum(ReportReason)
export type ReportReasonEnum = z.infer<typeof ReportReasonSchema>

export const ReportStatus = {
  PENDING : 'PENDING',
  REVIEWED: 'REVIEWED',
  RESOLVED: 'RESOLVED',
} as const

export const ReportStatusSchema = z.nativeEnum(ReportStatus)
export type ReportStatusEnum = z.infer<typeof ReportStatusSchema>

export const ModerationAction = {
  DELETE       : 'DELETE',
  HIDE         : 'HIDE',
  WARN         : 'WARN',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
} as const

export const ModerationActionSchema = z.nativeEnum(ModerationAction)
export type ModerationActionEnum = z.infer<typeof ModerationActionSchema>

// =============================================================================
// Requests
// =============================================================================

export const RequestStatus = {
  PENDING : 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const RequestStatusSchema = z.nativeEnum(RequestStatus)
export type RequestStatusEnum = z.infer<typeof RequestStatusSchema>

export const RemovalRequestType = {
  TAGGED_MEMBER  : 'TAGGED_MEMBER',
  UNTAGGED_MEMBER: 'UNTAGGED_MEMBER',
  UPLOADER       : 'UPLOADER',
} as const

export const RemovalRequestTypeSchema = z.nativeEnum(RemovalRequestType)
export type RemovalRequestTypeEnum = z.infer<typeof RemovalRequestTypeSchema>

// =============================================================================
// Events
// =============================================================================

export const EventRole = {
  OWNER   : 'OWNER',
  CO_OWNER: 'CO_OWNER',
  EDITOR  : 'EDITOR',
  VIEWER  : 'VIEWER',
} as const

export const EventRoleSchema = z.nativeEnum(EventRole)
export type EventRoleEnum = z.infer<typeof EventRoleSchema>

export const EventInstanceStatus = {
  ACTIVE  : 'ACTIVE',
  CANCELED: 'CANCELED',
} as const

export const EventInstanceStatusSchema = z.nativeEnum(EventInstanceStatus)
export type EventInstanceStatusEnum = z.infer<typeof EventInstanceStatusSchema>

export const RSVPStatus = {
  YES    : 'YES',
  NO     : 'NO',
  MAYBE  : 'MAYBE',
  PENDING: 'PENDING',
} as const

export const RSVPStatusSchema = z.nativeEnum(RSVPStatus)
export type RSVPStatusEnum = z.infer<typeof RSVPStatusSchema>

export const EventShareTarget = {
  GROUP : 'GROUP',
  FAMILY: 'FAMILY',
  MEMBER: 'MEMBER',
} as const

export const EventShareTargetSchema = z.nativeEnum(EventShareTarget)
export type EventShareTargetEnum = z.infer<typeof EventShareTargetSchema>

// =============================================================================
// Relationships
// =============================================================================

export const RelationshipType = {
  PARENT      : 'PARENT',
  CHILD       : 'CHILD',
  SIBLING     : 'SIBLING',
  SPOUSE      : 'SPOUSE',
  PARTNER     : 'PARTNER',
  GRANDPARENT : 'GRANDPARENT',
  GRANDCHILD  : 'GRANDCHILD',
  AUNT_UNCLE  : 'AUNT_UNCLE',
  NIECE_NEPHEW: 'NIECE_NEPHEW',
  COUSIN      : 'COUSIN',
} as const

export const RelationshipTypeSchema = z.nativeEnum(RelationshipType)
export type RelationshipTypeEnum = z.infer<typeof RelationshipTypeSchema>

// =============================================================================
// Invitations
// =============================================================================

export const InvitationStatus = {
  PENDING : 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED : 'EXPIRED',
} as const

export const InvitationStatusSchema = z.nativeEnum(InvitationStatus)
export type InvitationStatusEnum = z.infer<typeof InvitationStatusSchema>

// =============================================================================
// Notifications
// =============================================================================

export const NotificationType = {
  JOIN_REQUEST       : 'JOIN_REQUEST',
  APPROVAL           : 'APPROVAL',
  RELATIONSHIP       : 'RELATIONSHIP',
  EXPIRATION_REMINDER: 'EXPIRATION_REMINDER',
} as const

export const NotificationTypeSchema = z.nativeEnum(NotificationType)
export type NotificationTypeEnum = z.infer<typeof NotificationTypeSchema>

export const NotificationChannel = {
  IN_APP  : 'IN_APP',
  EMAIL   : 'EMAIL',
  PUSH    : 'PUSH',
  REALTIME: 'REALTIME',
} as const

export const NotificationChannelSchema = z.nativeEnum(NotificationChannel)
export type NotificationChannelType = z.infer<typeof NotificationChannelSchema>

export const NotificationDigest = {
  HOURLY: 'HOURLY',
  DAILY : 'DAILY',
  WEEKLY: 'WEEKLY',
  NEVER : 'NEVER',
} as const

export const NotificationDigestSchema = z.nativeEnum(NotificationDigest).default(NotificationDigest.DAILY)
export type NotificationDigestEnum = z.infer<typeof NotificationDigestSchema>
