"use client"

import { WithClassName } from '@peeps/types/src'
import type { ThemeName } from '@peeps/ui'
import { THEME_MODE_DARK, themeModeByName, themeNames } from '@peeps/ui'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

type ThemeSwitcherProps = WithClassName

const emptySubscribe = () => () => {}
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

function getNextTheme(current: ThemeName | undefined) {
  const index = themeNames.indexOf(current ?? themeNames[0])
  const next = themeNames[(index + 1) % themeNames.length]
  return next
}

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { setTheme, theme } = useTheme()
  const mounted = useMounted()

  const currentTheme = (theme as ThemeName | undefined) ?? themeNames[0]
  const mode = themeModeByName[currentTheme]

  if (!mounted) {
    return (
      <button className={className} type="button" disabled>
        <Sun className="h-4 w-4 opacity-0" />
      </button>
    )
  }

  return (
    <button
      className={className}
      type="button"
      onClick={() => setTheme(getNextTheme(currentTheme))}
    >
      {mode === THEME_MODE_DARK ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}
