"use client"

import { WithClassName } from '@peeps/types'
import type { ThemeName } from '@peeps/ui'
import { themeNames, themes } from '@peeps/ui'
import { cn } from '@peeps/utils/classnames'
import { Egg, Leaf, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

type ThemeSwitcherProps = WithClassName

const emptySubscribe = () => () => {}
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

function ThemeIcon(props: { icon: string }) {
  switch (props.icon) {
    case 'sun':
      return <Sun className="h-4 w-4" />
    case 'moon':
      return <Moon className="h-4 w-4" />
    case 'egg':
      return <Egg className="h-4 w-4" />
    case 'leaf':
      return <Leaf className="h-4 w-4" />
    default:
      return <Sun className="h-4 w-4" />
  }
}

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { setTheme, theme } = useTheme()
  const mounted = useMounted()

  const currentTheme = ((theme as ThemeName | undefined) ?? themeNames[0])

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {themeNames.map((name) => {
        const isActive = mounted && currentTheme === name
        const meta = themes[name]
        return (
          <button
            key={name}
            className={cn(
              'inline-flex items-center gap-2 rounded border border-border px-2 py-1 text-sm',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            type="button"
            disabled={!mounted}
            onClick={() => setTheme(name)}
          >
            <ThemeIcon icon={meta.icon} />
            <span className="hidden sm:inline">{meta.name}</span>
          </button>
        )
      })}
    </div>
  )
}
