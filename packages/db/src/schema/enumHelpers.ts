import { BaseFields } from './base'
import { enumColumn as enumColumnHelper } from '@peeps/utils'
import { z } from 'zod'

import {
  PrivacyLevel,
  FamilyNameCategory,
  GroupType,
  GroupPrivacyLevel,
  GovernanceModel,
  RemovalPolicy,
  GroupRole,
  MembershipStatus,
  EntityType,
  MediaType,
  TagStatus,
  BlockType,
  ReportReason,
  ReportStatus,
  ModerationAction,
  RequestStatus,
  RemovalRequestType,
  EventRole,
  EventInstanceStatus,
  RSVPStatus,
  EventShareTarget,
  RelationshipType,
  InvitationStatus,
  NotificationType,
  NotificationChannel,
  NotificationDigest,
} from '@peeps/types'

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

// Drizzle enum column helpers
export const privacyLevelEnum = (name: string) => enumColumnHelper(name, PrivacyLevel)
export const familyNameCategoryEnum = (name: string) => enumColumnHelper(name, FamilyNameCategory)
export const groupTypeEnum = (name: string) => enumColumnHelper(name, GroupType)
export const groupPrivacyLevelEnum = (name: string) => enumColumnHelper(name, GroupPrivacyLevel)
export const governanceModelEnum = (name: string) => enumColumnHelper(name, GovernanceModel)
export const removalPolicyEnum = (name: string) => enumColumnHelper(name, RemovalPolicy)
export const groupRoleEnum = (name: string) => enumColumnHelper(name, GroupRole)
export const membershipStatusEnum = (name: string) => enumColumnHelper(name, MembershipStatus)
export const entityTypeEnum = (name: string) => enumColumnHelper(name, EntityType)
export const mediaTypeEnum = (name: string) => enumColumnHelper(name, MediaType)
export const tagStatusEnum = (name: string) => enumColumnHelper(name, TagStatus)
export const blockTypeEnum = (name: string) => enumColumnHelper(name, BlockType)
export const reportReasonEnum = (name: string) => enumColumnHelper(name, ReportReason)
export const reportStatusEnum = (name: string) => enumColumnHelper(name, ReportStatus)
export const moderationActionEnum = (name: string) => enumColumnHelper(name, ModerationAction)
export const requestStatusEnum = (name: string) => enumColumnHelper(name, RequestStatus)
export const removalRequestTypeEnum = (name: string) => enumColumnHelper(name, RemovalRequestType)
export const eventRoleEnum = (name: string) => enumColumnHelper(name, EventRole)
export const eventInstanceStatusEnum = (name: string) => enumColumnHelper(name, EventInstanceStatus)
export const rsvpStatusEnum = (name: string) => enumColumnHelper(name, RSVPStatus)
export const eventShareTargetEnum = (name: string) => enumColumnHelper(name, EventShareTarget)
export const relationshipTypeEnum = (name: string) => enumColumnHelper(name, RelationshipType)
export const invitationStatusEnum = (name: string) => enumColumnHelper(name, InvitationStatus)
export const notificationTypeEnum = (name: string) => enumColumnHelper(name, NotificationType)
export const notificationChannelEnum = (name: string) => enumColumnHelper(name, NotificationChannel)
export const notificationDigestEnum = (name: string) => enumColumnHelper(name, NotificationDigest)
