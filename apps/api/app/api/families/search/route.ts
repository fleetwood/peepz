import { FamilyService } from '@peeps/services'
import { ApiRoute } from '@/lib/api/ApiRoute'
import {Logger} from "@peeps/utils";
import { handleOptions as OPTIONS } from '@/lib/api/cors'

const logger = Logger.instance('API/families/search', false)

export { OPTIONS }

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''

  return new ApiRoute(request)
    .pagination()
    .handle(async (ctx) => {
      return await FamilyService.search({ 
        query, 
        pagination: ctx.pagination! 
      })
    })
}
