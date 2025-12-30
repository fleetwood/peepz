"use client"

import * as React from 'react'

import { useRouter } from 'next/navigation'

import { createSupabaseClient } from '@peeps/client'
import { clientEnv } from '@peeps/config/env'
import Main from '@/components/layout/Main'

export default function OnboardingFamilyPage() {
  const router = useRouter()
  const supabase = React.useMemo(() => {
    return createSupabaseClient({
      supabaseUrl    : clientEnv.SUPABASE_URL,
      supabaseAnonKey: clientEnv.SUPABASE_ANON_KEY,
    })
  }, [])

  const [status, setStatus] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function resolveFamily() {
    setStatus(null)
    setSubmitting(true)

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setStatus(error.message)
        return
      }

      const accessToken = data.session?.access_token
      if (!accessToken) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/onboarding/family/resolve', {
        method : 'POST',
        headers: {
          Authorization : `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      const json = (await res.json()) as any
      if (!res.ok) {
        setStatus(json?.error ?? json?.message ?? 'Failed to resolve family')
        return
      }

      if (json?.onboarding?.needsApproval) {
        router.push('/onboarding/approval')
        return
      }

      router.push('/')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Main title="Connect with your family">
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
    </Main>
  )
}
