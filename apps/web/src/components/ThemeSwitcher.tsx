"use client"

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { THEME_MODE_DARK, themeModeByName, themeNames } from '@peeps/ui'
import type { ThemeName } from '@peeps/ui'
import { WithClassName } from '@peeps/types/src'

type ThemeSwitcherProps = WithClassName

function getNextTheme(current: string | undefined) {
  const index = themeNames.indexOf((current as ThemeName) ?? themeNames[0])
  const next = themeNames[(index + 1) % themeNames.length]
  return next
}

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const currentTheme = (resolvedTheme as ThemeName | undefined) ?? themeNames[0]
  const mode = themeModeByName[currentTheme]

  return (
    <button
      className={className}
      type="button"
      onClick={() => setTheme(getNextTheme(resolvedTheme))}
    >
      {mode === THEME_MODE_DARK ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}
