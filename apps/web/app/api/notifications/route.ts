import { ApiRoute } from '@/lib/api/ApiRoute'
import { NotificationService } from '@peeps/services'
import { ListNotificationsQuerySchema, ValidationSourceEnum } from '@peeps/types'

/**
 * GET /api/notifications
 * List notifications for the authenticated user.
 *
 * Query params:
 * - unreadOnly: boolean (optional) - Only return unread notifications
 * - limit: number (optional) - Max number of notifications to return
 */
export async function GET(request: Request) {
  return new ApiRoute(request)
    .auth(true)
    .validate(ValidationSourceEnum.QUERY, ListNotificationsQuerySchema)
    .handle(async (ctx) => {
      const memberId = ctx.authUserId!
      const { unreadOnly, limit, cursor } = ctx.validatedData?.query || {}

      const { notifications, nextCursor } = await NotificationService.getForMember(memberId, {
        limit,
        cursor,
        onlyUnread: unreadOnly,
      })

      return { notifications, nextCursor }
    })
}
