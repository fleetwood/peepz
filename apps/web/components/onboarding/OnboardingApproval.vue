<script setup lang="ts">
import { Logger } from '@peeps/utils'

const logger = Logger.instance('OnboardingApproval', false)

type EnsureMemberResponse = {
  member: unknown
  onboarding: {
    needsProfile?: boolean
    needsFamily?: boolean
    needsApproval?: boolean
  }
}

const status = ref<string | null>(null)
const checking = ref(false)
</script>

<template>
  <div>
    <div class="rounded bg-gray-100 p-3 text-sm">
      <p>
        To protect families from bots, Peeps requires confirmation before you can access family content.
      </p>
      <p class="mt-2">
        Approval requires:
      </p>
      <p>
        - 1 admin
      </p>
      <p>
        - or 2 non-admin family members
      </p>
    </div>

    <pre 
      v-if="status" 
      class="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm"
    >
      {{ status }}
    </pre>
  </div>
</template>
