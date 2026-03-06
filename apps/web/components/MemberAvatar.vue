<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { User } from 'lucide-vue-next'
import type { UserDto } from '@peeps/types'

interface Props {
  user: UserDto | null
  class?: string
  showEmail?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link'
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  showEmail: true,
  size: 'md',
  variant: 'default'
})

const emit = defineEmits<Emits>()

const avatarVariants = cva(
  'group flex items-center gap-2 w-full rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default  : 'hover:bg-accent hover:text-accent-foreground',
        primary  : 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost    : 'hover:bg-accent hover:text-accent-foreground',
        link     : 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'p-1',
        md: 'p-2',
        lg: 'p-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const containerSizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10', 
  lg: 'h-12 w-12'
}

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

const displayName = computed(() => 
  props.user?.preferredName || 
  props.user?.name?.[0] || 
  props.user?.auth?.email?.split('@')[0] || 
  'User'
)

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    :class="[avatarVariants({ variant: props.variant, size: props.size }), props.class]"
    @click="handleClick"
  >
    <div 
      :class="[
        'flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden',
        containerSizeClasses[size]
      ]"
    >
      <User 
        :class="[
          'flex-shrink-0',
          iconSizeClasses[size]
        ]" 
      />
    </div>
    
    <div class="hidden md:block text-left flex-1 min-w-0">
      <p class="text-sm font-medium truncate">
        {{ displayName }}
      </p>
      <p 
        v-if="showEmail && user?.auth?.email" 
        class="text-xs truncate transition-colors"
      >
        {{ user.auth.email }}
      </p>
    </div>
  </button>
</template>
