"use client"

import { useLayout } from '@/context/LayoutProvider'
import { WithClassName } from '@peeps/types'
import { themeNames, themes } from '@peeps/ui'
import { cn } from '@peeps/utils/classnames'
import { Egg, Leaf, Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'

type ThemeSwitcherProps = WithClassName
type ThemeName = keyof typeof themes

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
  const { setTheme, theme, mode, setMode } = useLayout()
  const mounted = useMounted()

  if (!mounted) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <div className="inline-flex items-center gap-2 rounded border border-border px-2 py-1 text-sm bg-background text-foreground">
          <div className="h-4 w-4" />
          <span className="hidden sm:inline">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Theme selection */}
      <div className="flex items-center gap-2">
        {themeNames.map((name) => {
          const isActive = mounted && theme === name
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
      
      {/* Light/Dark mode toggle */}
      <button
        className={cn(
          'inline-flex items-center gap-2 rounded border border-border px-2 py-1 text-sm',
          'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
        )}
        type="button"
        disabled={!mounted}
        onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
      >
        <ThemeIcon icon={mode === 'light' ? 'sun' : 'moon'} />
        <span className="hidden sm:inline">{mode === 'light' ? 'Light' : 'Dark'}</span>
      </button>
    </div>
  )
}
