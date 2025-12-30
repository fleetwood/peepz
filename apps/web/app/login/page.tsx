"use client"

import * as React from 'react'

import { useRouter } from 'next/navigation'

import { AuthClient } from '@peeps/client'

import { useCurrentUser } from '@/context/CurrentUserProvider'
import Login from '@/components/Login'

type EnsureMemberResponse = {
  member    : unknown

  onboarding: {
    needsProfile?: boolean
    needsFamily ?: boolean
    needsApproval?: boolean
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { user, userLoading, userError } = useCurrentUser()
  const authClient = React.useMemo(() => {
    return AuthClient.createWeb<EnsureMemberResponse>()
  }, [])

  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<EnsureMemberResponse | null>(null)


  async function continueAfterAuth() {
    setStatus(null)

    let json: EnsureMemberResponse

    try {
      json = await authClient.continueAfterAuth()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus(message)
      return
    }

    setResult(json)

    if (json.onboarding?.needsProfile) {
      router.push('/onboarding/profile')
      return
    }

    if (json.onboarding?.needsFamily) {
      router.push('/onboarding/family')
      return
    }

    if (json.onboarding?.needsApproval) {
      router.push('/onboarding/approval')
      return
    }

    router.push('/')
  }

  async function signOut() {
    setStatus(null)
    setResult(null)

    try {
      await authClient.signOut()
      setStatus('Signed out')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus(message)
    }
  }

  if (userLoading) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Login</h1>
        <div className="rounded bg-gray-100 p-3 text-sm">Loading...</div>
      </main>
    )
  }

  if (user) {
    const displayName = user.person?.preferredName ?? user.person?.name?.[0] ?? 'User'

    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Login</h1>

        <div className="rounded bg-gray-100 p-3 text-sm">Welcome {displayName}</div>

        <div className="flex flex-col gap-2">
          <button
            className="rounded bg-blue-600 px-3 py-2 text-white"
            type="button"
            onClick={() => router.push('/')}
          >
            Continue
          </button>

          <button
            className="rounded border px-3 py-2"
            type="button"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Login</h1>

      {userError ? (
        <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">
          {String(userError)}
        </pre>
      ) : null}

      <Login />

      <div className="flex flex-col gap-2">
        <button
          className="rounded bg-blue-600 px-3 py-2 text-white"
          type="button"
          onClick={continueAfterAuth}
        >
          Continue
        </button>

        <button
          className="rounded border px-3 py-2"
          type="button"
          onClick={signOut}
        >
          Sign out
        </button>
      </div>

      {status ? <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">{status}</pre> : null}
      {result ? <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">{JSON.stringify(result, null, 2)}</pre> : null}
    </main>
  )
}
