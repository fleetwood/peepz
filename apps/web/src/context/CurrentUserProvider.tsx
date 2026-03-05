"use client"

import * as React from 'react'

import { AuthClient, UserClient } from '@peeps/client'
import { UseMutationResult } from '@tanstack/react-query'
import type { UserDto } from '@peeps/types'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'

type CurrentUserContextValue = {
  user       : UserDto | null
  userLoading: boolean
  userError  : Error | null
  auth       : ReturnType<typeof AuthClient.createWeb<unknown>>
  updateProfile: UseMutationResult<{ member: any; person: any; onboarding: any }, Error, any, unknown>
}

const CurrentUserContext = React.createContext<CurrentUserContextValue | null>(null)

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const userClient = React.useMemo(() => UserClient.createWeb<UserDto>(), [])
  const [userOverride, setUserOverride] = React.useState<UserDto | null | undefined>(undefined)
  const supabaseClient = useSupabaseClient()

  const auth = React.useMemo(() => {
    const base = AuthClient.createWeb<unknown>()

    return {
      ...base,
      async continueAfterAuth() {
        const result = await base.continueAfterAuth()
        setUserOverride(undefined)
        await userClient.refetchMe()
        return result
      },
      async signOut() {
        setUserOverride(null)
        const result = await base.signOut()
        await userClient.refetchMe()
        return result
      },
    }
  }, [userClient])

  const query = userClient.useMe()
  const updateProfileMutation = userClient.useUpdateProfile()

  // Auto-call continueAfterAuth on mount if there's a Supabase session but no user data
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (session && !query.data && !query.isLoading && !query.isFetching) {
        await auth.continueAfterAuth()
      }
    }
    
    checkAuth()
  }, [supabaseClient, query.data, query.isLoading, query.isFetching, auth.continueAfterAuth])

  const value = React.useMemo(() => {
    return {
      user       : userOverride === undefined ? (query.data ?? null) : userOverride,
      userLoading: userOverride === undefined ? (query.isLoading || query.isFetching) : false,
      userError  : query.error as Error | null,
      auth,
      updateProfile: updateProfileMutation,
    } satisfies CurrentUserContextValue
  }, [auth, query.data, query.error, query.isFetching, query.isLoading, userOverride, updateProfileMutation])

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export function useCurrentUser() {
  const ctx = React.useContext(CurrentUserContext)
  if (!ctx) throw new Error('useCurrentUser must be used within CurrentUserProvider')
  return { user: ctx.user, userLoading: ctx.userLoading, userError: ctx.userError, auth: ctx.auth, updateProfile: ctx.updateProfile }
}