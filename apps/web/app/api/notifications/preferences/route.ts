import { ApiRoute } from '@/lib/api/ApiRoute'
import { NotificationService } from '@peeps/services'
import { UpdatePreferencesInputSchema, ValidationSourceEnum } from '@peeps/types'

/**
 * GET /api/notifications/preferences
 * Get notification preferences for the authenticated user.
 */
export async function GET(request: Request) {
  return new ApiRoute(request)
    .auth(true)
    .handle(async (ctx) => {
      const memberId = ctx.authUserId!

      const preferences = await NotificationService.getPreferences(memberId)

      return { preferences }
    })
}

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for the authenticated user.
 */
export async function PUT(request: Request) {
  return new ApiRoute(request)
    .auth(true)
    .validate(ValidationSourceEnum.BODY, UpdatePreferencesInputSchema)
    .handle(async (ctx) => {
      const memberId = ctx.authUserId!
      const updates = ctx.validatedData?.body

      const preferences = await NotificationService.updatePreferences(memberId, updates)

      return { preferences }
    })
}
