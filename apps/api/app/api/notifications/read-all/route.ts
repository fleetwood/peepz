import { ApiRoute } from '@/lib/api/ApiRoute'
import { NotificationService } from '@peeps/services'

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for the authenticated user.
 */
export async function POST(request: Request) {
  return new ApiRoute(request)
    .auth(true)
    .handle(async (ctx) => {
      const memberId = ctx.authUserId!
      await NotificationService.markAllAsRead(memberId)
      return { success: true }
    })
}
