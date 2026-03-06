'use client'

import { useMutation } from '@tanstack/react-query'

import { clientEnv } from '@peeps/config/env'
import {
  type ClientHttpConfig,
  type Notification,
  type NotificationListParams,
  type NotificationListResponse,
  type NotificationMarkReadParams,
  type NotificationPreferences,
  type NotificationPreferencesParams,
  type NotificationUpdatePreferencesParams,
} from '@peeps/types'
import { WebRestApi } from '../fetch/WebRestApi'

import { QueryManager } from '../QueryManager'
import { NotificationInvalidation, NotificationKeys } from './notification.invalidation'

type NotificationClientDeps = {
  list             : (params: NotificationListParams) => Promise<NotificationListResponse>
  markAsRead       : (params: NotificationMarkReadParams) => Promise<Notification>
  markAllAsRead    : () => Promise<boolean>
  getPreferences   : (params: NotificationPreferencesParams) => Promise<NotificationPreferences | null>
  updatePreferences: (params: NotificationUpdatePreferencesParams) => Promise<NotificationPreferences>
}

export const NotificationClient = {
  create(deps: NotificationClientDeps) {
    const base = {
      keys        : NotificationKeys,
      invalidation: NotificationInvalidation,

      list(params: NotificationListParams) {
        return deps.list(params)
      },

      markAsRead(params: NotificationMarkReadParams) {
        return deps.markAsRead(params)
      },

      markAllAsRead() {
        return deps.markAllAsRead()
      },

      getPreferences(params: NotificationPreferencesParams) {
        return deps.getPreferences(params)
      },

      updatePreferences(params: NotificationUpdatePreferencesParams) {
        return deps.updatePreferences(params)
      },

      useList(params: NotificationListParams) {
        return QueryManager.paginatedDomainQuery({
          ...NotificationKeys.list(params.filters),
          pagination: { limit: params.filters.limit ?? 20, cursor: params.filters.cursor },
          queryFn   : async () => deps.list(params),
        })
      },

      useUnreadCount(memberId: string) {
        return QueryManager.domainQuery<number>({
          ...NotificationKeys.unreadCount({ memberId }),
          queryFn: async () => {
            const { data, error, status, statusText } = await WebRestApi.fetch<{ notifications: Notification[]; count?: number }>(
              '/api/notifications?unreadOnly=true&limit=0'
            )
            if (error || !data) {
              throw new Error(`Failed to fetch unread count: ${status} ${statusText}`)
            }
            return data.count ?? data.notifications.length
          },
          refetchInterval: 30000,
        })
      },

      useMarkAsRead() {
        return useMutation({
          mutationFn: async (params: NotificationMarkReadParams) => deps.markAsRead(params),
          onSuccess : async () => {
            await NotificationInvalidation.invalidateAll()
          },
        })
      },

      useMarkAllAsRead() {
        return useMutation({
          mutationFn: async () => deps.markAllAsRead(),
          onSuccess : async () => {
            await NotificationInvalidation.invalidateAll()
          },
        })
      },

      usePreferences(params: NotificationPreferencesParams) {
        return QueryManager.domainQuery<NotificationPreferences | null>({
          ...NotificationKeys.preferences({ memberId: params.memberId }),
          queryFn: async () => deps.getPreferences(params),
        })
      },

      useUpdatePreferences() {
        return useMutation({
          mutationFn: async (params: NotificationUpdatePreferencesParams) => deps.updatePreferences(params),
          onSuccess : async (_, params) => {
            await NotificationInvalidation.invalidatePreferences({ memberId: params.memberId })
          },
        })
      },
    } as const

    return base
  },

  createHttp(config: ClientHttpConfig) {
    return NotificationClient.create({
      async list({ filters }) {
        const params = new URLSearchParams()
        if (filters.unreadOnly) params.set('unreadOnly', 'true')
        if (filters.limit) params.set('limit', String(filters.limit))
        if (filters.cursor) params.set('cursor', filters.cursor)

        const { data, error, status, statusText } = await WebRestApi.fetch<NotificationListResponse>(
          `/api/notifications${params.toString() ? `?${params.toString()}` : ''}`
        )

        if (error || !data) {
          throw new Error(`Failed to fetch notifications: ${status} ${statusText}`)
        }

        return data
      },

      async markAsRead({ notificationId }) {
        const { data, error, status, statusText } = await WebRestApi.post<{ notification: Notification }>(
          `/api/notifications/${notificationId}/read`,
          {}
        )

        if (error || !data) {
          throw new Error(`Failed to mark as read: ${status} ${statusText}`)
        }

        return data.notification
      },

      async markAllAsRead() {
        const { data, error, status, statusText } = await WebRestApi.post<{ success: boolean }>(
          '/api/notifications/read-all',
          {}
        )

        if (error || !data) {
          throw new Error(`Failed to mark all as read: ${status} ${statusText}`)
        }

        return data.success
      },

      async getPreferences() {
        const { data, error, status, statusText } = await WebRestApi.fetch<{ preferences: NotificationPreferences | null }>(
          '/api/notifications/preferences'
        )

        if (error || !data) {
          throw new Error(`Failed to fetch preferences: ${status} ${statusText}`)
        }

        return data.preferences
      },

      async updatePreferences({ memberId, updates }) {
        const { data, error, status, statusText } = await WebRestApi.put<{ preferences: NotificationPreferences }>(
          '/api/notifications/preferences',
          updates
        )

        if (error || !data) {
          throw new Error(`Failed to update preferences: ${status} ${statusText}`)
        }

        return data.preferences
      },
    })
  },
} as const

