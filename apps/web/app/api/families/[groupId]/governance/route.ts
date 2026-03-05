import { ApiRoute } from '@/lib/api/ApiRoute'
import { FamilyGovernanceSchema } from '@peeps/types'
import { ValidationSourceEnum } from '@peeps/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params
  
  return new ApiRoute(request)
    .auth(true)
    .params({ groupId })
    .validate(ValidationSourceEnum.BODY, FamilyGovernanceSchema)
    .handle(async (ctx) => {
      const governance = ctx.validatedData?.body as { model: string; config?: Record<string, unknown> }
      
      // TODO: Add service method to update governance
      // For now, return the governance data
      return {
        governance: {
          model : governance.model,
          config: governance.config,
        },
      }
    })
}
