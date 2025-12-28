"use client"

import * as React from 'react'

import { useRouter } from 'next/navigation'

import { AuthClient } from '@peeps/client'

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
  const authClient = React.useMemo(() => {
    return AuthClient.createWeb<EnsureMemberResponse>()
  }, [])

  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<EnsureMemberResponse | null>(null)

  async function signInWithEmail() {
    setStatus(null)
    setResult(null)

    try {
      const message = await authClient.signInWithEmail({ email })
      setStatus(message)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus(message)
    }
  }

  async function signInWithGoogle() {
    setStatus(null)
    setResult(null)

    try {
      await authClient.signInWithGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus(message)
    }
  }

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
      setStatus('Logged in. Next: POST /api/onboarding/profile')
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

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Login</h1>

      <div className="flex flex-col gap-2">
        <label className="text-sm">Email</label>
        <input
          className="rounded border px-3 py-2"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="rounded bg-black px-3 py-2 text-white"
          type="button"
          onClick={signInWithEmail}
        >
          Send magic link
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <button
          className="rounded border px-3 py-2"
          type="button"
          onClick={signInWithGoogle}
        >
          Continue with Google
        </button>
      </div>

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
