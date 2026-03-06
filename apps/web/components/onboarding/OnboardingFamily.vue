<script setup lang="ts">
import { Logger } from '@peeps/utils'

const logger = Logger.instance('OnboardingFamily', false)

const status = ref<string | null>(null)
const submitting = ref(false)

async function resolveFamily() {
  status.value = null
  submitting.value = true

  try {
    // TODO: Implement family resolution logic
    logger.info('Family resolution requested')
  } catch (err) {
    status.value = err instanceof Error ? err.message : String(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <p class="text-sm text-muted-foreground">
      Peeps requires family verification before you can access family content.
    </p>

    <button
      class="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-60"
      type="button"
      :disabled="submitting"
      @click="resolveFamily"
    >
      {{ submitting ? 'Working…' : 'Resolve family' }}
    </button>

    <pre 
      v-if="status" 
      class="whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm"
    >
      {{ status }}
    </pre>
  </div>
</template>
