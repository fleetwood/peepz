import { DomainDescriptor } from '../queryManager';
type FamilyDetailParams = {
    groupId: string;
};
type FamilySearchParams = {
    query: string;
};
type FamiliesByStubParams = {
    stub: string;
};
export declare class FamilyDomain {
    static list(): DomainDescriptor;
    static detail({ groupId }: FamilyDetailParams): DomainDescriptor;
    static search({ query }: FamilySearchParams): DomainDescriptor;
    static stubList({ stub }: FamiliesByStubParams): DomainDescriptor;
}
export {};
//# sourceMappingURL=family.domain.d.ts.map