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

export type UserDto = {
  member: UserMemberDto
  person: UserPersonDto
  auth  : UserAuthDto
}
