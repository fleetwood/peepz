import { QueryDomainEnum, QuerySubdomainEnum } from '@peeps/types'
import { QueryManager } from '../QueryManager'

type DetailParams = {
  id: string
}

export class PersonKeys {
  static list() {
    return {
      domain   : QueryDomainEnum.PERSONS,
      subdomain: QuerySubdomainEnum.LIST
    }
  }

  static detail(params: DetailParams) {
    return {
      domain   : QueryDomainEnum.PERSONS,
      subdomain: QuerySubdomainEnum.DETAIL,
      params,
    }
  }
}

export class PersonInvalidation {
  static invalidateList() {
    return QueryManager.invalidate(PersonKeys.list())
  }

  static refetchList() {
    return QueryManager.refetch(PersonKeys.list())
  }

  static invalidateDetail(params: DetailParams) {
    return QueryManager.invalidate(PersonKeys.detail({ id: params.id }))
  }

  static refetchDetail(params: DetailParams) {
    return QueryManager.refetch(PersonKeys.detail({ id: params.id }))
  }
}