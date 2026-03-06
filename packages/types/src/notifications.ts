import { z } from 'zod'
import {
  NotificationTypeSchema,
  NotificationChannelSchema,
  NotificationDigestSchema,
} from './enums'
import type { NotificationTypeEnum, NotificationChannelType, NotificationDigestEnum } from './enums'

// =============================================================================
// Enums
// =============================================================================

// Re-export for convenience
export type { NotificationChannelType, NotificationDigestEnum, NotificationTypeEnum } from './enums'
export { NotificationChannelSchema, NotificationDigestSchema, NotificationTypeSchema }

// =============================================================================
// Input Types
// =============================================================================

export const CreateNotificationInputSchema = z.object({
  memberId        : z.string().uuid(),
  groupId         : z.string().uuid().optional(),
  type            : NotificationTypeSchema,
  title           : z.string(),
  message         : z.string(),
  link            : z.string().optional(),
  relatedRequestId: z.string().uuid().optional(),
  relatedMemberId : z.string().uuid().optional(),
  channels        : z.array(NotificationChannelSchema).default(['IN_APP']),
})

export type CreateNotificationInput = z.infer<typeof CreateNotificationInputSchema>

// =============================================================================
// Factory Parameter Types
// =============================================================================

export type JoinRequestNotificationParams = {
  memberId         : string
  requesterMemberId: string
  requesterName    : string
  familyId         : string
  familyName       : string
  requestId        : string
}

export type ApprovalNotificationParams = {
  memberId    : string
  approverName: string
  familyId    : string
  familyName  : string
  requestId   : string
}

export type RelationshipNotificationParams = {
  memberId        : string
  claimerMemberId : string
  claimerName     : string
  relationshipType: string
  familyId        : string
  requestId       : string
}

// =============================================================================
// Preferences
// =============================================================================

export const NotificationPreferencesSchema = z.object({
  memberId           : z.string().uuid(),
  pushNotifications  : z.boolean().default(true),
  email              : z.boolean().default(true),
  sms                : z.boolean().default(false),
  realtime           : z.boolean().default(true),
  mentions           : z.boolean().default(true),
  directMessages     : z.boolean().default(true),
  allMessages        : z.boolean().default(true),
  digest             : NotificationDigestSchema,
  quietHoursEnabled  : z.boolean().default(false),
  quietHoursStart    : z.string().optional(),
  quietHoursEnd      : z.string().optional(),
  quietHoursTimezone : z.string().optional(),
})

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>

// =============================================================================
// API Types
// =============================================================================

export const ListNotificationsQuerySchema = z.object({
  unreadOnly: z.boolean().optional(),
  limit     : z.string().transform(Number).optional(),
  cursor    : z.string().optional(),
})

export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuerySchema>

export const MarkAsReadInputSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  all: z.boolean().optional(),
})

export type MarkAsReadInput = z.infer<typeof MarkAsReadInputSchema>

export const UpdatePreferencesInputSchema = NotificationPreferencesSchema.partial().omit({ memberId: true })

export type UpdatePreferencesInput = z.infer<typeof UpdatePreferencesInputSchema>

// =============================================================================
// Notification Entity Type (API response shape)
// =============================================================================

export type Notification = {
  id             : string
  memberId       : string
  groupId?       : string
  type           : NotificationTypeEnum
  title          : string
  message?       : string
  link?          : string
  relatedRequestId?: string
  relatedMemberId? : string
  channels       : NotificationChannelType[]
  read           : boolean
  readAt?        : Date
  hidden         : boolean
  createdAt      : Date
  updatedAt      : Date
}

// =============================================================================
// Client Types
// =============================================================================

export type NotificationListParams = {
  filters: ListNotificationsQuery
}

export type NotificationMarkReadParams = {
  notificationId: string
}

export type NotificationUnreadCountParams = {
  memberId: string
}

export type NotificationPreferencesParams = {
  memberId: string
}

export type NotificationUpdatePreferencesParams = {
  memberId: string
  updates: Partial<NotificationPreferences>
}

export type NotificationListResponse = {
  notifications: Notification[]
  nextCursor?: string
}
