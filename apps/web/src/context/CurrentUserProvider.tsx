"use client"

import * as React from 'react'

import { AuthClient, UserClient } from '@peeps/client'
import type { UserDto } from '@peeps/types/user/user.dto'

type CurrentUserContextValue = {
  user       : UserDto | null
  userLoading: boolean
  userError  : unknown
  auth       : ReturnType<typeof AuthClient.createWeb<unknown>>
}

const CurrentUserContext = React.createContext<CurrentUserContextValue | null>(null)

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const auth = React.useMemo(() => AuthClient.createWeb<unknown>(), [])
  const userClient = React.useMemo(() => UserClient.createWeb<UserDto>(), [])
  const query = userClient.useMe()

  const value = React.useMemo(() => {
    return {
      user       : query.data ?? null,
      userLoading: query.isLoading,
      userError  : query.error,
      auth,
    } satisfies CurrentUserContextValue
  }, [auth, query.data, query.error, query.isLoading])

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export function useCurrentUser() {
  const ctx = React.useContext(CurrentUserContext)
  if (!ctx) throw new Error('useCurrentUser must be used within CurrentUserProvider')
  return { user: ctx.user, userLoading: ctx.userLoading, userError: ctx.userError, auth: ctx.auth }
}