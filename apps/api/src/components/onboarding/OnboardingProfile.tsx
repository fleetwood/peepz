"use client"

import * as React from 'react'
import { Logger } from '@peeps/utils'
import { WebRestApi } from '@peeps/utils/fetch/web'

const logger = Logger.instance('OnboardingProfile', false)

const OnboardingProfile = () => {
 
  const [formData, setFormData] = React.useState({
    preferredName: '',
    firstName    : '',
    middleNames  : [] as string[],
    lastName     : '',
    dateOfBirth  : ''
  })

  const [submitting, setSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<string | null>(null)

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => setFormData(prev => ({ ...prev, [field]: value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    setSubmitting(true)
    setStatus(null)

    try {
      const name = [formData.firstName, ...formData.middleNames].map((s) => s.trim()).filter(Boolean)
      const family = formData.lastName.trim()

      const { error } = await WebRestApi.post(
        '/onboarding/profile',
        {
          name,
          dateOfBirth: formData.dateOfBirth,
          preferredName: formData.preferredName.trim() || undefined,
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
            value={formData.preferredName}
            onChange={(e) => updateField('preferredName', e.target.value)}
            placeholder="How do you prefer to be addressed?"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">First name</span>
          <input
            className="rounded border px-3 py-2"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            required
          />
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Middle names</span>
            <button
              className="rounded border px-2 py-1 text-sm"
              type="button"
              onClick={() => updateField('middleNames', [...formData.middleNames, ''])}
            >
              Add middle name
            </button>
          </div>

          {formData.middleNames.map((value, idx) => {
            return (
              <div className="flex gap-2" key={idx}>
                <input
                  className="flex-1 rounded border px-3 py-2"
                  value={value}
                  onChange={(e) => {
                    const next = [...formData.middleNames]
                    next[idx] = e.target.value
                    updateField('middleNames', next)
                  }}
                />
                <button
                  className="rounded border px-2"
                  type="button"
                  onClick={() => updateField('middleNames', formData.middleNames.filter((_, i) => i !== idx))}
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
            value={formData.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Last name</span>
          <input
            className="rounded border px-3 py-2"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
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
