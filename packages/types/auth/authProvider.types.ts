export const AuthProviderId = {
  email : 'email',
  google: 'google',
} as const

export type AuthProviderId = typeof AuthProviderId[keyof typeof AuthProviderId]

export type AuthProviderFactoryDeps = {
  redirectTo: string
}

export type AuthProvider<SignInParams, SendJoinParams> = {
  id   : AuthProviderId
  label: string

  signIn  : (params: SignInParams) => Promise<void | string>
  sendJoin: (params: SendJoinParams) => Promise<void | string>
}

export type AuthProviderRegistry = {
  get : (id: AuthProviderId) => AuthProvider<any, any>
  list: () => Array<AuthProvider<any, any>>
}
