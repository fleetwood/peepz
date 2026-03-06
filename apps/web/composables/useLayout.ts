import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '~/stores/theme'
import type { PageDialogProps, PagePopoverProps } from '@peeps/types'

export function useLayout() {
  const router = useRouter()
  const route = useRoute()
  const themeStore = useThemeStore()
  
  // Dialog state
  const dialog = ref<PageDialogProps>()
  
  function setDialog(props: PageDialogProps) {
    dialog.value = props
  }
  
  function closeDialog() {
    dialog.value = undefined
  }
  
  // Popover state
  const popover = ref<PagePopoverProps>()
  
  function setPopover(props: PagePopoverProps) {
    popover.value = props
  }
  
  function closePopover() {
    popover.value = undefined
  }
  
  // Navigation
  function navigate(path: string) {
    router.push(path)
  }
  
  const pathname = computed(() => route.path)
  
  // Theme (from store)
  const {
    theme,
    mode,
    colorTheme,
    combinedTheme,
    isWarmTheme,
    isPeepsTheme,
    isSystemMode,
    isDarkMode,
    isLightMode,
  } = storeToRefs(themeStore)
  
  const { setTheme, setMode } = themeStore
  
  return {
    // Theme
    theme,
    colorTheme,
    mode,
    isWarmTheme,
    isPeepsTheme,
    isSystemMode,
    isDarkMode,
    isLightMode,
    setTheme,
    setMode,
    
    // Navigation
    navigate,
    pathname,
    
    // Dialog
    dialog,
    setDialog,
    closeDialog,
    
    // Popover
    popover,
    setPopover,
    closePopover,
  }
}
