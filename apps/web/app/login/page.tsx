"use client"

import Login from '@/components/Login'
import AsyncContainer from '@/components/layout/AsyncContainer'
import { useCurrentUser } from '@/context/CurrentUserProvider'
import { useLoggedEffect } from '@/hooks/useLoggedEffect'
import * as React from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { user, userLoading, userError, auth } = useCurrentUser()
  const router = useRouter()
  const didContinue = React.useRef(false)
  const [continueLoading, setContinueLoading] = React.useState(false)
  const [continueError, setContinueError] = React.useState<Error | null>(null)

  useLoggedEffect({
    name: 'LoginPage.continueAfterAuth',
    deps: [auth, router, user, userLoading],
    effect: () => {
      if (didContinue.current) return
      if (userLoading) return
      if (user) {
        didContinue.current = true
        router.replace('/onboarding')
        return
      }

      didContinue.current = true
      setContinueLoading(true)
      setContinueError(null)

      auth
        .continueAfterAuthResult()
        .then((result) => {
          if (result.kind === 'ok') {
            router.replace('/onboarding')
            return
          }

          router.replace('/login')
        })
        .catch((err) => {
          setContinueError(err instanceof Error ? err : new Error(String(err)))
        })
        .finally(() => {
          setContinueLoading(false)
        })
    },
  })

  const error = React.useMemo(() => {
    if (!userError) return null
    if (userError instanceof Error) return userError
    return { message: String(userError) }
  }, [userError])

  const mergedError = React.useMemo(() => {
    return continueError ?? error
  }, [continueError, error])

  return (
    <AsyncContainer isLoading={[userLoading, continueLoading]} error={[mergedError]}>
      <Login />
    </AsyncContainer>
  )
}
