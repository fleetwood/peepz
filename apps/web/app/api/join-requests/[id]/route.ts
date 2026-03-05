import { ApiRoute } from '@/lib/api/ApiRoute'
import { FamilyJoinRequestService } from '@peeps/services'
import { ApproveRequestInputSchema } from '@peeps/types'
import { ValidationSourceEnum } from '@peeps/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  
  return new ApiRoute(request)
    .auth(true)
    .params({ id })
    .handle(async (ctx) => {
      const joinRequest = await FamilyJoinRequestService.get({ requestId: ctx.params!.id })

      if (!joinRequest) {
        throw new Error('Join request not found')
      }

      return {
        joinRequest: {
          id                  : joinRequest.id,
          status              : joinRequest.status,
          confirmations       : joinRequest.confirmations,
          claimedRelationships: joinRequest.claimedRelationships,
          expiresAt           : joinRequest.expiresAt,
        },
      }
    })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  
  return new ApiRoute(request)
    .auth(true)
    .params({ id })
    .validate(ValidationSourceEnum.BODY, ApproveRequestInputSchema)
    .handle(async (ctx) => {
      const input = ctx.validatedData?.body as { confirmationType: 'ADMIN' | 'MEMBER' }
      
      const result = await FamilyJoinRequestService.approve({
        requestId    : ctx.params!.id,
        actorMemberId: ctx.authUserId!,
        confirmationType: input.confirmationType,
      })

      return {
        joinRequest: {
          id     : result.id,
          status : result.status,
          confirmations: result.confirmations,
        },
      }
    })
}
