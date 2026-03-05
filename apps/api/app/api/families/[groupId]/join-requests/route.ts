import { ApiRoute } from '@/lib/api/ApiRoute'
import { FamilyJoinRequestService } from '@peeps/services'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params
  
  return new ApiRoute(request)
    .auth(true)
    .params({ groupId })
    .handle(async (ctx) => {
      const joinRequests = await FamilyJoinRequestService.listPendingForFamily({ 
        groupId: ctx.params!.groupId 
      })

      return {
        joinRequests: joinRequests.map((jr) => ({
          id                  : jr.id,
          memberId            : jr.memberId,
          status              : jr.status,
          confirmations       : jr.confirmations,
          claimedRelationships: jr.claimedRelationships,
          expiresAt           : jr.expiresAt,
          createdAt           : jr.createdAt,
        })),
      }
    })
}
