"use client"

import * as React from 'react'

import { useRouter } from 'next/navigation'

import { createSupabaseClient } from '@peeps/client'
import { clientEnv } from '@peeps/config/env'

const defaultFamilyNameCategory = 'paternal'

export default function OnboardingProfilePage() {
  const router = useRouter()
  const supabase = React.useMemo(() => {
    return createSupabaseClient({
      supabaseUrl    : clientEnv.SUPABASE_URL,
      supabaseAnonKey: clientEnv.SUPABASE_ANON_KEY,
    })
  }, [])

  const [preferredName, setPreferredName] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [dateOfBirth, setDateOfBirth] = React.useState('')
  const [familyName, setFamilyName] = React.useState('')

  const [submitting, setSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
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
        setStatus('No session. Please log in again.')
        router.push('/login')
        return
      }

      const name = fullName
        .split(' ')
        .map((p) => p.trim())
        .filter(Boolean)

      const res = await fetch('/api/onboarding/profile', {
        method : 'POST',
        headers: {
          Authorization : `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          dateOfBirth,
          preferredName: preferredName.trim() || undefined,
          familyNames  : [
            {
              name    : familyName.trim(),
              category: defaultFamilyNameCategory,
              active  : true,
              order   : 0,
            },
          ],
        }),
      })

      const json = (await res.json()) as any

      if (!res.ok) {
        setStatus(json?.error ?? json?.message ?? 'Failed to update profile')
        return
      }

      if (json?.onboarding?.needsFamily) {
        router.push('/onboarding/family')
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
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Finish your profile</h1>

      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Preferred name</span>
          <input
            className="rounded border px-3 py-2"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder="What should we call you?"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Full name</span>
          <input
            className="rounded border px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="First Middle Last"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Date of birth</span>
          <input
            className="rounded border px-3 py-2"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Family name</span>
          <input
            className="rounded border px-3 py-2"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Last name"
            required
          />
        </label>

        <button
          className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Continue'}
        </button>
      </form>

      {status ? <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">{status}</pre> : null}
    </main>
  )
}
