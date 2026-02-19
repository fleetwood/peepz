import { QueryDomainEnum, QuerySubdomainEnum, DomainDescriptor } from '../queryManager'

type FamilyDetailParams = {
  groupId: string
}

type FamilySearchParams = {
  query: string
}

type FamiliesByStubParams = {
  stub: string
}

export class FamilyDomain {
  static list(): DomainDescriptor {
    return {
      domain   : QueryDomainEnum.FAMILIES,
      subdomain: QuerySubdomainEnum.LIST,
      topic    : new Set([QueryDomainEnum.FAMILIES, QuerySubdomainEnum.LIST]),
    }
  }

  static detail({ groupId }: FamilyDetailParams): DomainDescriptor {
    return {
      domain   : QueryDomainEnum.FAMILIES,
      subdomain: QuerySubdomainEnum.DETAIL,
      params   : { groupId },
      topic    : new Set([QueryDomainEnum.FAMILIES, QuerySubdomainEnum.DETAIL, groupId]),
    }
  }

  static search({ query }: FamilySearchParams): DomainDescriptor {
    return {
      domain   : QueryDomainEnum.FAMILIES,
      subdomain: QuerySubdomainEnum.LIST,
      params   : { query },
      topic    : new Set([QueryDomainEnum.FAMILIES, QuerySubdomainEnum.LIST, query]),
    }
  }

  static stubList({ stub }: FamiliesByStubParams): DomainDescriptor {
    return {
      domain   : QueryDomainEnum.FAMILIES,
      subdomain: QuerySubdomainEnum.LIST,
      params   : { stub },
      topic    : new Set([QueryDomainEnum.FAMILIES, QuerySubdomainEnum.LIST, stub]),
    }
  }
}
