'use client'

import {
  NotificationChannel,
  NotificationType,
} from '@peeps/db/schema/enums'
import type {
  ApprovalNotificationParams,
  CreateNotificationInput,
  JoinRequestNotificationParams,
  RelationshipNotificationParams,
} from '@peeps/types'

const {IN_APP, EMAIL, REALTIME} = NotificationChannel
/**
 * Factory functions for creating notification inputs.
 * These create the input payloads that are passed to NotificationService.create()
 */
export const NotificationFactories = {
  /**
   * Creates a join request notification for family admins.
   */
  joinRequest(params: JoinRequestNotificationParams): CreateNotificationInput {
    return {
      memberId        : params.memberId,
      type            : NotificationType.JOIN_REQUEST,
      title           : 'New Family Join Request',
      message         : `${params.requesterName} wants to join ${params.familyName}`,
      link            : `/families/${params.familyId}/requests/${params.requestId}`,
      relatedRequestId: params.requestId,
      relatedMemberId : params.requesterMemberId,
      channels        : [ IN_APP, EMAIL, REALTIME ],
    }
  },

  /**
   * Creates a join request approval notification for the requester.
   */
  joinRequestApproval(params: ApprovalNotificationParams): CreateNotificationInput {
    return {
      memberId        : params.memberId,
      type            : NotificationType.APPROVAL,
      title           : 'Join Request Approved',
      message         : `${params.approverName} approved your request to join ${params.familyName}`,
      link            : `/families/${params.familyId}`,
      relatedRequestId: params.requestId,
      channels        : [ IN_APP, EMAIL, REALTIME ],
    }
  },

  /**
   * Creates a relationship claim notification.
   */
  relationship(params: RelationshipNotificationParams): CreateNotificationInput {
    return {
      memberId        : params.memberId,
      type            : NotificationType.RELATIONSHIP,
      title           : 'New Relationship Claimed',
      message         : `${params.claimerName} claims to be your ${params.relationshipType}`,
      link            : `/families/${params.familyId}/requests/${params.requestId}`,
      relatedRequestId: params.requestId,
      relatedMemberId : params.claimerMemberId,
      channels        : [IN_APP, EMAIL],
    }
  },
}
