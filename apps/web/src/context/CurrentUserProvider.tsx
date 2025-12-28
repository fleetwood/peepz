"use client"

import * as React from 'react'

import { useQuery } from '@tanstack/react-query'

import { AuthClient } from '@peeps/client'
import type { Member } from '@peeps/db/schema'

type EnsureMemberResponse = {
  member: Member
}

type CurrentUserContextValue = {
  user       : Member | null
  userLoading: boolean
  userError  : unknown
  auth       : ReturnType<typeof AuthClient.createWeb<EnsureMemberResponse>>
}

const CurrentUserContext = React.createContext<CurrentUserContextValue | null>(null)

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const auth = React.useMemo(() => AuthClient.createWeb<EnsureMemberResponse>(), [])

  const query = useQuery({
    queryKey: ['current-user'],
    queryFn : async () => {
      try {
        return await auth.continueAfterAuth()
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('No session yet')) return null
        throw err
      }
    },
    retry: false,
  })

  const value = React.useMemo(() => {
    return {
      user       : query.data?.member ?? null,
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