export type GovernanceValue = 'SINGLE_ADMIN' | 'HIERARCHICAL' | 'CONSENSUS' | 'DEMOCRATIC'
export type GroupPrivacyValue = 'PRIVATE' | 'PUBLIC' | 'APPROVAL'
export type FamilySettingsConfig = 'access' | 'request' | 'vote' | 'none'

export type FamilySearchResult = {
  families: {
    id       : string
    groupId  : string
    createdAt: string
    updatedAt: string
  }
  groups: {
    id               : string
    name             : string
    type             : string
    description?     : string
    privacyLevel     : string
    governanceModel  : string
    removalPolicy    : string
    createdByMemberId: string
    createdAt        : string
    updatedAt        : string
  }
  membership?: {
    id       : string
    groupId  : string
    personId : string
    role     : string
    status   : string
    joinedAt : string
    createdAt: string
    updatedAt: string
  }
  members: Array<{
    membership: {
      id       : string
      groupId  : string
      personId : string
      role     : string
      status   : string
      joinedAt : string
      createdAt: string
      updatedAt: string
    }
    person: {
      id           : string
      name         : string[]
      firstName   ?: string | null
      lastName    ?: string | null
      preferredName?: string | null
      avatarUrl   ?: string | null
    }
  }>
}
