<script setup lang="ts">
interface Props {
  class?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8'
}
</script>

<template>
  <SpinnerIcon 
    :class="[
      sizeClasses[size],
      props.class
    ]"
  />
</template>
