<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn, Logger } from '@peeps/utils'
import { Clipboard } from 'lucide-vue-next'

interface Props {
  label?: string
  data: any
  open?: boolean
  maxHeight?: string
  logger?: Logger
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  maxHeight: '200px'
})

const isOpen = ref(props.open)

const shouldShow = computed(() => {
  return !props.logger || props.logger.isActive
})

function handleClipboard(e: MouseEvent) {
  e.stopPropagation()
  navigator.clipboard.writeText(JSON.stringify(props.data, null, 2))
  // You could add a toast notification here if you have one
  console.log('Data copied to clipboard')
}
</script>

<template>
  <div v-if="shouldShow" :class="cn('mt-4', props.class)">
    <details 
      :open="isOpen"
      class="cursor-pointer"
      @toggle="isOpen = ($event.target as HTMLDetailsElement).open"
    >
      <summary class="text-xs text-muted-foreground cursor-pointer flex gap-2 items-center justify-between">
        <div>
          Debug<span v-if="label">: {{ label }}</span>
        </div>
        <Clipboard 
          class="h-4 w-4 cursor-copy hover:text-accent" 
          @click="handleClipboard" 
        />
      </summary>
      <pre 
        class="text-xs overflow-auto p-2 bg-muted/50 rounded mt-2 whitespace-pre-wrap break-words cursor-pointer"
        :style="{ maxHeight: maxHeight }"
        @click="handleClipboard"
      >{{ JSON.stringify(data, null, 2) }}</pre>
    </details>
  </div>
</template>
