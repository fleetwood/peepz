import { QueryDomainEnum, DomainDescriptor } from '../queryManager'

type FamilyPresenceParams = {
  groupId: string
}

export class PresenceDomain {
  static global(): Pick<DomainDescriptor, 'topic'> {
    return {
      topic: new Set(['presence']),
    }
  }

  static family({ groupId }: FamilyPresenceParams): Pick<DomainDescriptor, 'topic'> {
    return {
      topic: new Set(['presence', QueryDomainEnum.FAMILIES, groupId]),
    }
  }
}
