import { QueryDomainEnum, QuerySubdomainEnum } from '@peeps/types'
import { QueryManager } from '../QueryManager'

type ResolveFamilyParams = {
  key: 'resolve-family'
}

type FamilyDetailParams = {
  groupId: string
}

type FamilySearchParams = {
  query: string
}

export class FamilyKeys {
  static resolve() {
    return {
      domain   : QueryDomainEnum.FAMILIES,
      subdomain: QuerySubdomainEnum.DETAIL,
      params   : { key: 'resolve-family' } satisfies ResolveFamilyParams,
    }
  }

  static list() {
    return {
      domain   : QueryDomainEnum.FAMILIES,
      subdomain: QuerySubdomainEnum.LIST,
    }
  }

  static detail({ groupId }: FamilyDetailParams) {
    return {
      domain   : QueryDomainEnum.FAMILIES,
      subdomain: QuerySubdomainEnum.DETAIL,
      params   : { groupId } satisfies FamilyDetailParams,
    }
  }

  static search({ query }: FamilySearchParams) {
    return {
      domain   : QueryDomainEnum.FAMILIES,
      subdomain: QuerySubdomainEnum.LIST,
      params   : { query } satisfies FamilySearchParams,
    }
  }
}

export class FamilyInvalidation {
  static invalidateResolve() {
    return QueryManager.invalidate(FamilyKeys.resolve())
  }

  static invalidateList() {
    return QueryManager.invalidate(FamilyKeys.list())
  }

  static invalidateDetail({ groupId }: FamilyDetailParams) {
    return QueryManager.invalidate(FamilyKeys.detail({ groupId }))
  }

  static invalidateSearch({ query }: FamilySearchParams) {
    return QueryManager.invalidate(FamilyKeys.search({ query }))
  }

  static refetchResolve() {
    return QueryManager.refetch(FamilyKeys.resolve())
  }

  static refetchList() {
    return QueryManager.refetch(FamilyKeys.list())
  }

  static refetchDetail({ groupId }: FamilyDetailParams) {
    return QueryManager.refetch(FamilyKeys.detail({ groupId }))
  }

  static refetchSearch({ query }: FamilySearchParams) {
    return QueryManager.refetch(FamilyKeys.search({ query }))
  }
}
