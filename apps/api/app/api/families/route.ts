import { GovernanceModel, GroupPrivacyLevel, RemovalPolicy } from '@peeps/db/schema/enums'
import { FamilyService, MemberService } from '@peeps/services'

import { ApiRoute } from '@/lib/api/ApiRoute'

export async function GET(request: Request) {
  return new ApiRoute(request)
    .pagination()
    .handle(async (ctx) => {
      return await FamilyService.list({ pagination: ctx.pagination! })
    })
}

export async function POST(request: Request) {
  return new ApiRoute(request)
    .auth(true)
    .handle(async (ctx) => {
      const body = await request.json().catch(() => null)
      const name = typeof body?.name === 'string' ? body.name.trim() : ''
      if (!name) {
        return Response.json({ error: 'Family name required' }, { status: 400 })
      }

      const memberResult = await MemberService.byAuthUserId({ authUserId: ctx.authUserId! })
      if (!memberResult.result) {
        return Response.json({ error: 'Member not found' }, { status: 404 })
      }

      const {
        description = '',
        privacyLevel = GroupPrivacyLevel.PRIVATE,
        governanceModel = GovernanceModel.SINGLE_ADMIN,
        removalPolicy = RemovalPolicy.IMMEDIATE,
        voteThreshold = null,
      } = body ?? {}

      const payload = await FamilyService.create({
        memberId      : memberResult.result.id,
        personId      : memberResult.result.personId,
        name,
        description,
        privacyLevel,
        governanceModel,
        removalPolicy,
        voteThreshold : typeof voteThreshold === 'number' ? voteThreshold : null,
      })

      return payload
    })
}
