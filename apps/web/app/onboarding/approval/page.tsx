"use client"

import * as React from 'react'

import { useRouter } from 'next/navigation'

import { AuthClient } from '@peeps/client'
import Main from '@/components/layout/Main'

type EnsureMemberResponse = {
  member    : unknown

  onboarding: {
    needsProfile? : boolean
    needsFamily  ?: boolean
    needsApproval?: boolean
  }
}

export default function OnboardingApprovalPage() {
  const router = useRouter()
  const authClient = React.useMemo(() => {
    return AuthClient.createWeb<EnsureMemberResponse>()
  }, [])

  const [status, setStatus] = React.useState<string | null>(null)
  const [checking, setChecking] = React.useState(false)

  async function checkStatus() {
    setStatus(null)
    setChecking(true)

    try {
      const json = await authClient.continueAfterAuth()

      if (json.onboarding?.needsProfile) {
        router.push('/onboarding/profile')
        return
      }

      if (json.onboarding?.needsFamily) {
        router.push('/onboarding/family')
        return
      }

      if (json.onboarding?.needsApproval) {
        setStatus('Still waiting for approval.')
        return
      }

      router.push('/')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err))
    } finally {
      setChecking(false)
    }
  }

  return (
    <Main title="Waiting for approval">

      <div className="rounded bg-gray-100 p-3 text-sm">
        <p>
          To protect families from bots, Peeps requires confirmation before you can access family content.
        </p>
        <p className="mt-2">
          Approval requires:
        </p>
        <p>
          - 1 admin
        </p>
        <p>
          - or 2 non-admin family members
        </p>
      </div>

      <button
        className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-60"
        type="button"
        disabled={checking}
        onClick={checkStatus}
      >
        {checking ? 'Checking…' : 'Check status'}
      </button>

      {status ? <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">{status}</pre> : null}
    </Main>
  )
}
