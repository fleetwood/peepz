"use client"

import * as React from 'react'
import { Logger } from '@peeps/utils'
import { postApi } from '@peeps/utils/rest'

const logger = Logger.instance('OnboardingProfile')

const OnboardingProfile = () => {
 
  const [preferredName, setPreferredName] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [middleNames, setMiddleNames] = React.useState<string[]>([])
  const [lastName, setLastName] = React.useState('')
  const [dateOfBirth, setDateOfBirth] = React.useState('')

  const [submitting, setSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    setSubmitting(true)
    setStatus(null)

    try {
      const name = [firstName, ...middleNames].map((s) => s.trim()).filter(Boolean)
      const family = lastName.trim()

      const { error } = await postApi(
        '/onboarding/profile',
        {
          name,
          dateOfBirth,
          preferredName: preferredName.trim() || undefined,
          familyNames  : family
            ? [{ name: family, category: 'other', active: true, order: 0 }]
            : [],
        },
      )

      if (error) {
        setStatus(error)
      } else {
        setStatus('Saved')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error('Failed to save profile', { message })
      setStatus(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
          <span className="text-sm">First name</span>
          <input
            className="rounded border px-3 py-2"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Middle names</span>
            <button
              className="rounded border px-2 py-1 text-sm"
              type="button"
              onClick={() => setMiddleNames((prev) => [...prev, ''])}
            >
              Add middle name
            </button>
          </div>

          {middleNames.map((value, idx) => {
            return (
              <div className="flex gap-2" key={idx}>
                <input
                  className="flex-1 rounded border px-3 py-2"
                  value={value}
                  onChange={(e) => {
                    const next = [...middleNames]
                    next[idx] = e.target.value
                    setMiddleNames(next)
                  }}
                />
                <button
                  className="rounded border px-2"
                  type="button"
                  onClick={() => setMiddleNames((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>

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
          <span className="text-sm">Last name</span>
          <input
            className="rounded border px-3 py-2"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
        {status ? <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">{status}</pre> : null}
      </form>
  )
}

OnboardingProfile.displayName = "OnboardingProfile"
export default OnboardingProfile
