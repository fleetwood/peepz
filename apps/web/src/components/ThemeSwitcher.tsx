"use client"

import * as React from 'react'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeName = 'light' | 'dark'

type ThemeSwitcherProps = {
  className?: string
}

type ThemeState = {
  theme   : ThemeName
  setTheme: (next: ThemeName) => void
  toggle  : () => void
}

function applyTheme(next: ThemeName) {
  document.documentElement.dataset.theme = next
  document.cookie = `theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: typeof document === 'undefined' ? 'light' : (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'),
      setTheme: (next) => {
        applyTheme(next)
        set({ theme: next })
      },
      toggle: () => {
        const next: ThemeName = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: 'theme',
    }
  )
)

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <button className={className} type="button" onClick={toggle}>
      {theme === 'dark' ? 'Dark' : 'Light'}
    </button>
  )
}
