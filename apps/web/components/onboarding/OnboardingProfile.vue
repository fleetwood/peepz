<script setup lang="ts">
import { Logger } from '@peeps/utils'
import { WebRestApi } from '@peeps/utils/fetch/web'

const logger = Logger.instance('OnboardingProfile', false)

const formData = ref({
  preferredName: '',
  firstName: '',
  middleNames: [] as string[],
  lastName: '',
  dateOfBirth: ''
})

const submitting = ref(false)
const status = ref<string | null>(null)

const updateField = <K extends keyof typeof formData>(
  field: K,
  value: typeof formData[K]
) => {
  (formData.value as any)[field] = value
}

const addMiddleName = () => {
  formData.value.middleNames.push('')
}

const removeMiddleName = (index: number) => {
  formData.value.middleNames = formData.value.middleNames.filter((_, i) => i !== index)
}

const updateMiddleName = (index: number, value: string) => {
  const next = [...formData.value.middleNames]
  next[index] = value
  formData.value.middleNames = next
}

async function onSubmit(e: Event) {
  e.preventDefault()

  submitting.value = true
  status.value = null

  try {
    const name = [formData.value.firstName, ...formData.value.middleNames]
      .map((s) => s.trim())
      .filter(Boolean)
    const family = formData.value.lastName.trim()

    const { error } = await WebRestApi.post(
      '/onboarding/profile',
      {
        name,
        dateOfBirth: formData.value.dateOfBirth,
        preferredName: formData.value.preferredName.trim() || undefined,
        familyNames: family
          ? [{ name: family, category: 'other', active: true, order: 0 }]
          : [],
      }
    )

    if (error) {
      status.value = error
    } else {
      status.value = 'Saved'
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Failed to save profile', { message })
    status.value = message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-3" @submit="onSubmit">
    <label class="flex flex-col gap-1">
      <span class="text-sm">Preferred name</span>
      <input
        class="rounded border px-3 py-2"
        v-model="formData.preferredName"
        placeholder="How do you prefer to be addressed?"
      />
    </label>

    <label class="flex flex-col gap-1">
      <span class="text-sm">First name</span>
      <input
        class="rounded border px-3 py-2"
        v-model="formData.firstName"
        required
      />
    </label>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-sm">Middle names</span>
        <button
          class="rounded border px-2 py-1 text-sm"
          type="button"
          @click="addMiddleName"
        >
          Add middle name
        </button>
      </div>

      <div 
        v-for="(value, idx) in formData.middleNames" 
        :key="idx"
        class="flex gap-2"
      >
        <input
          class="flex-1 rounded border px-3 py-2"
          :value="value"
          @input="updateMiddleName(idx, ($event.target as HTMLInputElement).value)"
        />
        <button
          class="rounded border px-2"
          type="button"
          @click="removeMiddleName(idx)"
        >
          Remove
        </button>
      </div>
    </div>

    <label class="flex flex-col gap-1">
      <span class="text-sm">Date of birth</span>
      <input
        class="rounded border px-3 py-2"
        type="date"
        v-model="formData.dateOfBirth"
        required
      />
    </label>

    <label class="flex flex-col gap-1">
      <span class="text-sm">Last name</span>
      <input
        class="rounded border px-3 py-2"
        v-model="formData.lastName"
        required
      />
    </label>

    <button
      class="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-60"
      type="submit"
      :disabled="submitting"
    >
      {{ submitting ? 'Saving…' : 'Continue' }}
    </button>
    
    <pre 
      v-if="status" 
      class="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm"
    >
      {{ status }}
    </pre>
  </form>
</template>
