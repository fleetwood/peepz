export const AuthProviderId = {
  email : 'email',
  google: 'google',
} as const

export type AuthProviderId = typeof AuthProviderId[keyof typeof AuthProviderId]

export type AuthProviderFactoryDeps = {
  redirectTo: string
}

export type AuthProvider<Params> = {
  id   : AuthProviderId
  label: string

  signIn: (params: Params) => Promise<void | string>
}

export type AuthProviderRegistry = {
  get : (id: AuthProviderId) => AuthProvider<any>
  list: () => Array<AuthProvider<any>>
}
