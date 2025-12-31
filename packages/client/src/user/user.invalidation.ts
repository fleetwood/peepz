import { QueryDomainEnum, QuerySubdomainEnum } from '@peeps/types'
import { QueryManager } from '../QueryManager'

type MeParams = {
  key: 'me'
}

export class UserKeys {
  static me() {
    return {
      domain   : QueryDomainEnum.USER,
      subdomain: QuerySubdomainEnum.DETAIL,
      params   : { key: 'me' } satisfies MeParams,
    }
  }
}

export class UserInvalidation {
  static invalidateMe() {
    return QueryManager.invalidate(UserKeys.me())
  }

  static refetchMe() {
    return QueryManager.refetch(UserKeys.me())
  }
}
