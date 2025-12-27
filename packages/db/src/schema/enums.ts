import { BaseFields } from './base'
import { enumColumn } from '@peeps/utils'
import { z } from 'zod'

export type EnumRecord = typeof BaseFields & {
  enumValue: string // The enum value (e.g. 'foo_bar')
  enumName: string // The enum name (e.g. 'Foo Bar')
  description: string // Human readable description
}

export const toEnumValues = (records: EnumRecord[]): string[] => records.map(r => r.enumValue)

export const fromEnumValues = <T extends string>(
  values: T[],
  allRecords: EnumRecord[]
): EnumRecord[] => values.map(v => allRecords.find(r => r.enumValue === v)!)

export const createEnumValidator = <T extends string>(
  records: EnumRecord[],
  errorMessage: string
) => {
  return z.custom<T>(val => records.some(r => r.enumValue === val && r.visible), {
    message: errorMessage
  })
}

export const PrivacyLevel = {
  PUBLIC: 'PUBLIC',
  FAMILY: 'FAMILY',
  PRIVATE: 'PRIVATE',
} as const

export const privacyLevelEnum = (name: string) => enumColumn(name, PrivacyLevel)

export const FamilyNameCategory = {
  paternal : 'paternal',
  maternal : 'maternal',
  adopted  : 'adopted',
  surrogate: 'surrogate',
  chosen   : 'chosen',
  other    : 'other',
} as const

export const familyNameCategoryEnum = (name: string) => enumColumn(name, FamilyNameCategory)

export const GroupType = {
  FAMILY : 'FAMILY',
  FRIENDS: 'FRIENDS',
  CLUB   : 'CLUB',
  OTHER  : 'OTHER',
} as const

export const groupTypeEnum = (name: string) => enumColumn(name, GroupType)

export const GroupPrivacyLevel = {
  PRIVATE    : 'PRIVATE',
  INVITE_ONLY: 'INVITE_ONLY',
} as const

export const groupPrivacyLevelEnum = (name: string) => enumColumn(name, GroupPrivacyLevel)

export const GovernanceModel = {
  SINGLE_ADMIN: 'SINGLE_ADMIN',
  HIERARCHICAL: 'HIERARCHICAL',
  CONSENSUS   : 'CONSENSUS',
  DEMOCRATIC  : 'DEMOCRATIC',
} as const

export const governanceModelEnum = (name: string) => enumColumn(name, GovernanceModel)

export const RemovalPolicy = {
  IMMEDIATE          : 'IMMEDIATE',
  VOTE_REQUIRED      : 'VOTE_REQUIRED',
  CONSENSUS_REQUIRED : 'CONSENSUS_REQUIRED',
} as const

export const removalPolicyEnum = (name: string) => enumColumn(name, RemovalPolicy)

export const GroupRole = {
  ADMIN : 'ADMIN',
  MEMBER: 'MEMBER',
} as const

export const groupRoleEnum = (name: string) => enumColumn(name, GroupRole)

export const MembershipStatus = {
  ACTIVE : 'ACTIVE',
  INVITED: 'INVITED',
  REMOVED: 'REMOVED',
} as const

export const membershipStatusEnum = (name: string) => enumColumn(name, MembershipStatus)

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

export const entityTypeEnum = (name: string) => enumColumn(name, EntityType)

export const MediaType = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
} as const

export const mediaTypeEnum = (name: string) => enumColumn(name, MediaType)

export const TagStatus = {
  PENDING : 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const tagStatusEnum = (name: string) => enumColumn(name, TagStatus)

export const BlockType = {
  BLOCK: 'BLOCK',
  MUTE : 'MUTE',
} as const

export const blockTypeEnum = (name: string) => enumColumn(name, BlockType)

export const RequestStatus = {
  PENDING : 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const requestStatusEnum = (name: string) => enumColumn(name, RequestStatus)

export const RemovalRequestType = {
  TAGGED_MEMBER  : 'TAGGED_MEMBER',
  UNTAGGED_MEMBER: 'UNTAGGED_MEMBER',
  UPLOADER       : 'UPLOADER',
} as const

export const removalRequestTypeEnum = (name: string) => enumColumn(name, RemovalRequestType)

export const ReportReason = {
  SPAM         : 'SPAM',
  INAPPROPRIATE: 'INAPPROPRIATE',
  HARASSMENT   : 'HARASSMENT',
  OTHER        : 'OTHER',
} as const

export const reportReasonEnum = (name: string) => enumColumn(name, ReportReason)

export const ReportStatus = {
  PENDING : 'PENDING',
  REVIEWED: 'REVIEWED',
  RESOLVED: 'RESOLVED',
} as const

export const reportStatusEnum = (name: string) => enumColumn(name, ReportStatus)

export const EventRole = {
  OWNER   : 'OWNER',
  CO_OWNER: 'CO_OWNER',
  EDITOR  : 'EDITOR',
  VIEWER  : 'VIEWER',
} as const

export const eventRoleEnum = (name: string) => enumColumn(name, EventRole)

export const EventInstanceStatus = {
  ACTIVE  : 'ACTIVE',
  CANCELED: 'CANCELED',
} as const

export const eventInstanceStatusEnum = (name: string) => enumColumn(name, EventInstanceStatus)

export const RSVPStatus = {
  YES    : 'YES',
  NO     : 'NO',
  MAYBE  : 'MAYBE',
  PENDING: 'PENDING',
} as const

export const rsvpStatusEnum = (name: string) => enumColumn(name, RSVPStatus)

export const EventShareTarget = {
  GROUP : 'GROUP',
  FAMILY: 'FAMILY',
  MEMBER: 'MEMBER',
} as const

export const eventShareTargetEnum = (name: string) => enumColumn(name, EventShareTarget)
