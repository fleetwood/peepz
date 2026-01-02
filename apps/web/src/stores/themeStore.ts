import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: string
  mode: ThemeMode
  
  // Actions
  setTheme: (theme: string) => void
  setMode: (mode: ThemeMode) => void
  
  // Computed
  getColorTheme: () => string
  getCombinedTheme: () => string
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'peeps',
      mode: 'system',
      
      setTheme: (theme) => {
        set({ theme })
      },
      
      setMode: (mode) => {
        set({ mode })
      },
      
      getColorTheme: () => {
        const { theme } = get()
        // Extract color theme from combined theme or return as-is
        const parts = theme.split('-')
        return parts[0] || theme
      },
      
      getCombinedTheme: () => {
        const { theme, mode } = get()
        const colorTheme = get().getColorTheme()
        
        if (mode === 'system') {
          return colorTheme
        }
        return `${colorTheme}-${mode}`
      },
    }),
    {
      name: 'theme-store',
    }
  )
)

// Helper to update HTML attributes
function updateHtmlAttributes(theme: string, mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  const colorTheme = theme.split('-')[0] || theme
  
  html.setAttribute('data-theme', colorTheme)
  html.setAttribute('data-mode', mode)
}

// Keep html data attributes in sync with store (client-only)
if (typeof window !== 'undefined') {
  const sync = ({ theme, mode }: ThemeStore) => updateHtmlAttributes(theme, mode)
  sync(useThemeStore.getState())
  useThemeStore.subscribe(sync)
}
