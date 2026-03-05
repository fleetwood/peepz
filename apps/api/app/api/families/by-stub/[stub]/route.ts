"use server"

import { ApiRoute } from "@/lib/api/ApiRoute"
import { FamilyService, MemberService } from "@peeps/services"

export async function GET(request: Request, { params }: { params: Promise<{ stub: string }> }) {
  const routeParams = await params

  return new ApiRoute(request)
    .auth(true)
    .handle(async (ctx) => {
      if (!ctx.authUserId || !ctx.accessToken) {
        return new Response(null, { status: 401 })
      }

      const memberResult = await MemberService.byAuthUserId({ authUserId: ctx.authUserId })
      const member = memberResult.result
      if (!member) {
        return new Response(null, { status: 404 })
      }

      return FamilyService.listByStubForMember({
        stub    : routeParams.stub,
        personId: member.personId,
      })
    })
}
