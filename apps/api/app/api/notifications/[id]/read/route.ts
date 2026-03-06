import { ApiRoute } from '@/lib/api/ApiRoute'
import { NotificationService } from '@peeps/services'

/**
 * POST /api/notifications/[id]/read
 * Mark a specific notification as read.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  return new ApiRoute(request)
    .auth(true)
    .params({ id })
    .handle(async (ctx) => {
      const memberId = ctx.authUserId!
      const notificationId = ctx.params!.id

      const [updated] = await NotificationService.markAsRead(memberId, [notificationId])
      return { notification: updated }
    })
}
