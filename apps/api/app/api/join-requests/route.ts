import { ApiRoute } from '@/lib/api/ApiRoute'
import { FamilyJoinRequestService } from '@peeps/services'
import { CreateJoinRequestInputSchema } from '@peeps/types'
import { ValidationSourceEnum } from '@peeps/types'

export async function POST(request: Request) {
  return new ApiRoute(request)
    .auth(true)
    .validate(ValidationSourceEnum.BODY, CreateJoinRequestInputSchema)
    .handle(async (ctx) => {
      const input = ctx.validatedData?.body as { familyId: string; inviteCode?: string }
      
      const result = await FamilyJoinRequestService.create({
        memberId: ctx.authUserId!,
        familyId: input.familyId,
        inviteCode: input.inviteCode,
      })

      return {
        joinRequest: {
          id      : result.id,
          status  : result.status,
          expiresAt: result.expiresAt,
        },
      }
    })
}
