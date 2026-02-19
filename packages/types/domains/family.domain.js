import { QueryDomainEnum, QuerySubdomainEnum } from '../queryManager';
export class FamilyDomain {
    static list() {
        return {
            domain: QueryDomainEnum.FAMILIES,
            subdomain: QuerySubdomainEnum.LIST,
            topic: new Set([QueryDomainEnum.FAMILIES, QuerySubdomainEnum.LIST]),
        };
    }
    static detail({ groupId }) {
        return {
            domain: QueryDomainEnum.FAMILIES,
            subdomain: QuerySubdomainEnum.DETAIL,
            params: { groupId },
            topic: new Set([QueryDomainEnum.FAMILIES, QuerySubdomainEnum.DETAIL, groupId]),
        };
    }
    static search({ query }) {
        return {
            domain: QueryDomainEnum.FAMILIES,
            subdomain: QuerySubdomainEnum.LIST,
            params: { query },
            topic: new Set([QueryDomainEnum.FAMILIES, QuerySubdomainEnum.LIST, query]),
        };
    }
    static stubList({ stub }) {
        return {
            domain: QueryDomainEnum.FAMILIES,
            subdomain: QuerySubdomainEnum.LIST,
            params: { stub },
            topic: new Set([QueryDomainEnum.FAMILIES, QuerySubdomainEnum.LIST, stub]),
        };
    }
}
