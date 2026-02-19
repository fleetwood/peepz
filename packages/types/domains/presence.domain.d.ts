import { DomainDescriptor } from '../queryManager';
type FamilyPresenceParams = {
    groupId: string;
};
export declare class PresenceDomain {
    static global(): Pick<DomainDescriptor, 'topic'>;
    static family({ groupId }: FamilyPresenceParams): Pick<DomainDescriptor, 'topic'>;
}
export {};
//# sourceMappingURL=presence.domain.d.ts.map