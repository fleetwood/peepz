"use client"
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AuthClient } from '@peeps/client'
import { Logger } from '@peeps/utils'

const logger = Logger.instance('OnboardingApproval')

type EnsureMemberResponse = {
  member    : unknown

  onboarding: {
    needsProfile? : boolean
    needsFamily  ?: boolean
    needsApproval?: boolean
  }
}

const OnboardingApproval = () => {
  const router = useRouter()
  const [status, setStatus] = React.useState<string | null>(null)
  const [checking, setChecking] = React.useState(false)

  return (
    <div>

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

      {status ? <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">{status}</pre> : null}
    </div>
  )
}

OnboardingApproval.displayName = "OnboardingApproval"
export default OnboardingApproval
