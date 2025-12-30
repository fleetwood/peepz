import { QueryDomainEnum, QuerySubdomainEnum } from '@peeps/types/queryManager'

import { QueryManager } from '../QueryManager'

type EnsureMemberParams = {
  key: 'ensure-member'
}

export class AuthKeys {
  static ensureMember() {
    return {
      domain   : QueryDomainEnum.MEMBERS,
      subdomain: QuerySubdomainEnum.DETAIL,
      params   : { key: 'ensure-member' } satisfies EnsureMemberParams,
    }
  }
}

export class AuthInvalidation {
  static invalidateEnsureMember() {
    return QueryManager.invalidate(AuthKeys.ensureMember())
  }

  static refetchEnsureMember() {
    return QueryManager.refetch(AuthKeys.ensureMember())
  }
}
