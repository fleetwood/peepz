import { useThemeStore } from '~/stores/theme'
import { defineNuxtPlugin } from '#app'
import { nextTick } from 'vue'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Wait for Pinia persistence to restore state
  await nextTick()
  
  const themeStore = useThemeStore()
  const html = document.documentElement

  // Apply theme immediately from store (which loads from localStorage via Pinia persistence)
  html.setAttribute('data-theme', themeStore.colorTheme)
  html.setAttribute('data-mode', themeStore.mode)
  html.className = themeStore.combinedTheme
})
