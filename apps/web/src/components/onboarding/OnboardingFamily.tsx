"use client"

import * as React from 'react'
import { Logger } from '@peeps/utils'

const logger = Logger.instance('OnboardingFamily')

const OnboardingFamily = () => {
  const [status, setStatus] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function resolveFamily() {
    setStatus(null)
    setSubmitting(true)

    try {
     
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Peeps requires family verification before you can access family content.
      </p>

      <button
        className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-60"
        type="button"
        disabled={submitting}
        onClick={resolveFamily}
      >
        {submitting ? 'Working…' : 'Resolve family'}
      </button>

      {status ? <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">{status}</pre> : null}
    </div>
  )
}

OnboardingFamily.displayName = "OnboardingFamily"
export default OnboardingFamily
