<template>
  <div :class="combinedTheme" :data-theme="colorTheme" :data-mode="mode" class="h-full">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
const { combinedTheme, colorTheme, mode } = storeToRefs(themeStore)
</script>
