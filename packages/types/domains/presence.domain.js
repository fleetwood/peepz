import { QueryDomainEnum } from '../queryManager';
export class PresenceDomain {
    static global() {
        return {
            topic: new Set(['presence']),
        };
    }
    static family({ groupId }) {
        return {
            topic: new Set(['presence', QueryDomainEnum.FAMILIES, groupId]),
        };
    }
}
