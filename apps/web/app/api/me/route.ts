import { ApiRoute as ApiRouteClass } from '@/lib/api/ApiRoute'
import { UserService } from '@peeps/services'

export async function GET(request: Request) {
  return new ApiRouteClass(request)
    .auth(true)
    .handle(async ({ authUserId, email }) =>
      await UserService.byAuthUserId({ authUserId, email })
    )
}
