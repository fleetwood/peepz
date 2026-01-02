import { QueryDomainEnum, QuerySubdomainEnum } from '@peeps/types'
import { QueryManager } from '../QueryManager'

type MeParams = {
  key: 'me'
}

type UpdateProfileParams = {
  key: 'updateProfile'
}

export class UserKeys {
  static me() {
    return {
      domain   : QueryDomainEnum.USER,
      subdomain: QuerySubdomainEnum.DETAIL,
      params   : { key: 'me' } satisfies MeParams,
    }
  }

  static updateProfile() {
    return {
      domain   : QueryDomainEnum.USER,
      subdomain: QuerySubdomainEnum.DETAIL,
      params   : { key: 'updateProfile' } satisfies UpdateProfileParams,
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
