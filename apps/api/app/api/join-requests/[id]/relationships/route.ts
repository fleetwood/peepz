import { ApiRoute } from '@/lib/api/ApiRoute'
import { FamilyJoinRequestService } from '@peeps/services'
import { UpdateRelationshipsInputSchema } from '@peeps/types'
import { ValidationSourceEnum } from '@peeps/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  
  return new ApiRoute(request)
    .auth(true)
    .params({ id })
    .validate(ValidationSourceEnum.BODY, UpdateRelationshipsInputSchema)
    .handle(async (ctx) => {
      const input = ctx.validatedData?.body as { relationships: Array<{ targetMemberId: string; type: string }> }
      
      const result = await FamilyJoinRequestService.updateRelationships({
        requestId    : ctx.params!.id,
        relationships: input.relationships as unknown as Array<{ targetMemberId: string; type: 'PARENT' | 'CHILD' | 'SIBLING' | 'SPOUSE' | 'PARTNER' }>,
      })

      return {
        joinRequest: {
          id                  : result.id,
          claimedRelationships: result.claimedRelationships,
        },
      }
    })
}
