import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref<string>('peeps')
  const mode = ref<ThemeMode>('system')

  // Computed
  const colorTheme = computed(() => {
    const parts = theme.value.split('-')
    return parts[0] || theme.value
  })

  const combinedTheme = computed(() => {
    if (mode.value === 'system') {
      return colorTheme.value
    }
    return `${colorTheme.value}-${mode.value}`
  })

  const isWarmTheme = computed(() => colorTheme.value === 'warm')
  const isPeepsTheme = computed(() => !isWarmTheme.value)
  const isSystemMode = computed(() => mode.value === 'system')
  const isDarkMode = computed(() => mode.value === 'dark')
  const isLightMode = computed(() => !isDarkMode.value)

  // Actions
  function setTheme(newTheme: string) {
    theme.value = newTheme
  }

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
  }

  // Helper to update HTML attributes
  function updateHtmlAttributes() {
    if (typeof document === 'undefined') return
    const html = document.documentElement
    
    html.setAttribute('data-theme', colorTheme.value)
    html.setAttribute('data-mode', mode.value)
    html.className = combinedTheme.value
  }

  // Watch for changes and update HTML attributes (client-only)
  if (typeof window !== 'undefined') {
    watch([theme, mode], updateHtmlAttributes, { immediate: true })
  }

  return {
    // State
    theme,
    mode,
    
    // Computed
    colorTheme,
    combinedTheme,
    isWarmTheme,
    isPeepsTheme,
    isSystemMode,
    isDarkMode,
    isLightMode,
    
    // Actions
    setTheme,
    setMode,
  }
}, {
  persist: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
  }
})
