export type UserAuthDto = {
  authUserId: string
  email     : string
}

export type UserMemberDto = {
  id          : string
  personId    : string
  authUserId  : string
  email       : string
  privacyLevel: 'PUBLIC' | 'FAMILY' | 'PRIVATE'
  createdAt   : string
  updatedAt   : string
  visible     : boolean
}

export type UserPersonDto = {
  id           : string
  name         : string[]
  dateOfBirth  : string
  preferredName: string | null
  createdAt    : string
  updatedAt    : string
  visible      : boolean
}

export type UserFamilyDto = {
  id        : string
  name      : string
  createdAt : string
  updatedAt : string
  visible   : boolean
}

export type UserFamilyJoinRequestDto = {
  id        : string
  familyId  : string
  memberId  : string
  status    : 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt : string
  updatedAt : string
}

export type UserDto = UserPersonDto & {
  member            : UserMemberDto
  auth              : UserAuthDto
  fullName          : string
  families          : UserFamilyDto[]
  familyJoinRequests: UserFamilyJoinRequestDto[]
  needsOnboarding   : boolean
}
