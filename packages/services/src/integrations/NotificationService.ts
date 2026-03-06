import { db } from '@peeps/db/client'
import * as schema from '@peeps/db/schema'
import { NotificationChannel } from '@peeps/db/schema/enums'
import type { CreateNotificationInput } from '@peeps/types'
import { Logger } from '@peeps/utils'
import { and, desc, eq, gte, inArray, lt } from 'drizzle-orm'
import { MemberService } from '../entities/MemberService'
import { ResendService } from './ResendService'

const logger = Logger.instance('NotificationService', false)

export class NotificationService {
  /**
   * Creates and delivers a notification.
   *
   * 1. Persists to `notifications` table
   * 2. Checks user preferences for channels
   * 3. Sends email via ResendService if enabled
   * 4. Broadcasts via SocketClient if enabled (future)
   *
   * @param input - Notification payload
   * @returns The created notification
   *
   * DB SCOPE:
   * - SELECT: notification_preferences
   * - INSERT: notifications
   * - scope : ✅ CLEAN (single responsibility)
   */
  static async create(input: CreateNotificationInput): Promise<schema.Notification> {
    const { memberId, channels, ...notifData } = input

    // Get member with preferences from MemberService
    const memberResult = await MemberService.getWithPreferences({ id: memberId })

    if (!memberResult.result) {
      throw new Error(`Member not found: ${memberId}`)
    }

    const { member, preferences: prefs } = memberResult.result
    const memberEmail = member.email

    // Filter channels based on preferences
    const allowedChannels = channels.filter((channel) => {
      if (!prefs) return true // Default to all if no prefs set
      switch (channel) {
        case NotificationChannel.EMAIL:
          return prefs.email
        case NotificationChannel.PUSH:
          return prefs.pushNotifications
        case NotificationChannel.REALTIME:
          return prefs.realtime
        case NotificationChannel.IN_APP:
          return true // Always allow in-app
        default:
          return false
      }
    })

    // Insert notification
    const [notification] = await db
      .insert(schema.notifications)
      .values({
        memberId,
        ...notifData,
      })
      .returning()

    // Send email if enabled
    if (allowedChannels.includes(NotificationChannel.EMAIL) && memberEmail) {
      try {
        await ResendService.sendEmail({
          to: memberEmail,
          subject: notifData.title,
          html: `<p>${notifData.message}</p>`,
        })
      } catch (error) {
        logger.error('Failed to send email notification', { error, memberId, notificationId: notification.id })
      }
    }

    // TODO: Real-time delivery via SocketClient

    return notification
  }

  /**
   * Marks notifications as read.
   *
   * @param memberId - Member ID
   * @param ids - Optional array of notification IDs to mark as read
   * @returns Updated notifications
   *
   * DB SCOPE:
   * - UPDATE: notifications
   * - scope : ✅ CLEAN
   */
  static async markAsRead(memberId: string, ids?: string[]): Promise<schema.Notification[]> {
    const idsToUpdate = ids && ids.length > 0 ? ids : undefined

    return await db
      .update(schema.notifications)
      .set({ read: true, readAt: new Date() })
      .where(
        and(
          eq(schema.notifications.memberId, memberId),
          idsToUpdate
            ? inArray(schema.notifications.id, idsToUpdate)
            : eq(schema.notifications.read, false)
        )
      )
      .returning()
  }

  /**
   * Marks notifications as hidden (soft delete from UI view).
   *
   * @param memberId - Member ID
   * @param ids - Optional array of notification IDs to hide (if omitted, hides all)
   * @returns Updated notifications
   *
   * DB SCOPE:
   * - UPDATE: notifications
   * - scope : ✅ CLEAN
   */
  static async hide(memberId: string, ids?: string[]): Promise<schema.Notification[]> {
    const idsToHide = ids && ids.length > 0 ? ids : undefined

    return await db
      .update(schema.notifications)
      .set({ visible: false })
      .where(
        and(
          eq(schema.notifications.memberId, memberId),
          idsToHide
            ? inArray(schema.notifications.id, idsToHide)
            : eq(schema.notifications.visible, true)
        )
      )
      .returning()
  }

  /**
   * Permanently deletes a notification.
   *
   * @param memberId - Member ID
   * @param id - Notification ID to delete
   * @returns Deleted notification or undefined
   *
   * DB SCOPE:
   * - DELETE: notifications
   * - scope : ✅ CLEAN
   */
  static async delete(memberId: string, id: string): Promise<schema.Notification | undefined> {
    const [deleted] = await db
      .delete(schema.notifications)
      .where(and(eq(schema.notifications.id, id), eq(schema.notifications.memberId, memberId)))
      .returning()

    return deleted
  }

  /**
   * Marks all notifications as read.
   *
   * @param memberId - Member ID
   *
   * DB SCOPE:
   * - UPDATE: notifications
   * - scope : ✅ CLEAN
   */
  static async markAllAsRead(memberId: string): Promise<void> {
    await db
      .update(schema.notifications)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(schema.notifications.memberId, memberId), eq(schema.notifications.read, false)))
  }

  /**
   * Gets unread notifications for a user.
   *
   * @param memberId - Member ID
   * @param limit - Optional limit
   * @returns Array of unread notifications
   *
   * DB SCOPE:
   * - SELECT: notifications
   * - scope : ✅ CLEAN
   */
  static async getUnread(memberId: string, limit?: number): Promise<schema.Notification[]> {
    const query = db
      .select()
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.memberId, memberId),
          eq(schema.notifications.read, false),
          eq(schema.notifications.visible, true)
        )
      )
      .orderBy(desc(schema.notifications.createdAt))

    if (limit) {
      return await query.limit(limit)
    }

    return await query
  }

  /**
   * Gets notifications for a member (read or unread), ordered by created date descending.
   *
   * @param memberId - Member ID
   * @param limit - Optional limit
   * @returns Array of notifications
   *
   * DB SCOPE:
   * - SELECT: notifications
   * - scope : ✅ CLEAN
   */
  static async getForMember(
    memberId: string,
    options?: { limit?: number; cursor?: string; onlyUnread?: boolean }
  ): Promise<{ notifications: schema.Notification[]; nextCursor?: string }> {
    const { limit = 20, cursor, onlyUnread } = options || {}

    const conditions = [
      eq(schema.notifications.memberId, memberId),
      eq(schema.notifications.visible, true),
    ]

    if (onlyUnread) {
      conditions.push(eq(schema.notifications.read, false))
    }

    if (cursor) {
      conditions.push(lt(schema.notifications.createdAt, new Date(cursor)))
    }

    const rows = await db
      .select()
      .from(schema.notifications)
      .where(and(...conditions))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit + 1) // Get one extra to determine if there's more

    const hasMore = rows.length > limit
    const notifications = hasMore ? rows.slice(0, limit) : rows
    const nextCursor = hasMore && notifications.length > 0
      ? notifications[notifications.length - 1].createdAt.toISOString()
      : undefined

    return { notifications, nextCursor }
  }

  /**
   * Gets notifications for digest email.
   *
   * @param memberId - Member ID
   * @param date - Optional date (defaults to last 24 hours)
   * @returns Array of notifications for digest
   *
   * DB SCOPE:
   * - SELECT: notifications
   * - SELECT: notification_preferences
   * - scope : ✅ CLEAN
   */
  static async getDigest(memberId: string, date?: Date): Promise<schema.Notification[]> {
    const since = date || new Date(Date.now() - 24 * 60 * 60 * 1000)

    return await db
      .select()
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.memberId, memberId),
          eq(schema.notifications.read, false),
          eq(schema.notifications.visible, true),
          gte(schema.notifications.createdAt, since)
        )
      )
      .orderBy(desc(schema.notifications.createdAt))
  }

  /**
   * Gets notification preferences for a member.
   *
   * @param memberId - Member ID
   * @returns Notification preferences or null
   *
   * DB SCOPE:
   * - SELECT: notification_preferences
   * - scope : ✅ CLEAN
   */
  static async getPreferences(memberId: string): Promise<schema.NotificationPreferences | null> {
    const [prefs] = await db
      .select()
      .from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.memberId, memberId))
      .limit(1)

    return prefs ?? null
  }

  /**
   * Updates notification preferences for a member.
   *
   * @param memberId - Member ID
   * @param updates - Preference updates
   * @returns Updated preferences
   *
   * DB SCOPE:
   * - UPDATE: notification_preferences (or INSERT if not exists)
   * - scope : ✅ CLEAN
   */
  static async updatePreferences(
    memberId: string,
    updates: Partial<schema.NotificationPreferences>
  ): Promise<schema.NotificationPreferences> {
    // Try update first
    const [updated] = await db
      .update(schema.notificationPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.notificationPreferences.memberId, memberId))
      .returning()

    if (updated) {
      return updated
    }

    // Insert if not exists
    const [created] = await db
      .insert(schema.notificationPreferences)
      .values({
        memberId,
        ...updates,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return created
  }
}

export { NotificationFactories } from './NotificationFactories'
