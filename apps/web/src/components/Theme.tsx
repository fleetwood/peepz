"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { materializeTheme, themes } from "@peeps/ui"
import { cva } from "class-variance-authority"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import ThemeSwitcher from "./ThemeSwitcher"

type ThemeName = keyof typeof themes

type SwatchColor =  | "primary" | "secondary" | "accent" | "success" | "warning" | "danger" | "info" | "neutral" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "gold" |"parchment"  

const variantConfig = {
  primary  : {
    text: 'text-primary',
    bg: 'bg-primary',
    border: 'border-primary'
  },
  secondary  : {
    text: 'text-secondary',
    bg: 'bg-secondary',
    border: 'border-secondary'
  },
  accent  : {
    text: 'text-accent',
    bg: 'bg-accent',
    border: 'border-accent'
  },
  success  : {
    text: 'text-success',
    bg: 'bg-success',
    border: 'border-success'
  },
  warning  : {
    text: 'text-warning',
    bg: 'bg-warning',
    border: 'border-warning'
  },
  danger  : {
    text: 'text-danger',
    bg: 'bg-danger',
    border: 'border-danger'
  },
  info  : {
    text: 'text-info',
    bg: 'bg-info',
    border: 'border-info'
  },
  parchment  : {
    text: 'text-parchment',
    bg: 'bg-parchment',
    border: 'border-parchment'
  },
  netural  : {
    text: 'text-netural',
    bg: 'bg-netural',
    border: 'border-netural'
  },
  gold  : {
    text: 'text-gold',
    bg: 'bg-gold',
    border: 'border-gold'
  },
  red  : {
    text: 'text-red',
    bg: 'bg-red',
    border: 'border-red'
  },
  orange  : {
    text: 'text-orange',
    bg: 'bg-orange',
    border: 'border-orange'
  },
  yellow  : {
    text: 'text-yellow',
    bg: 'bg-yellow',
    border: 'border-yellow'
  },
  green  : {
    text: 'text-green',
    bg: 'bg-green',
    border: 'border-green'
  },
  blue  : {
    text: 'text-blue',
    bg: 'bg-blue',
    border: 'border-blue'
  },
  purple  : {
    text: 'text-purple',
    bg: 'bg-purple',
    border: 'border-purple'
  }
} as const

const bgVariant = cva('h-10 w-10 rounded-md border border-border', 
  {
    variants: {
      variant: {
        primary  : 'bg-primary',
        secondary: 'bg-secondary',
        accent   : 'bg-accent',
        success  : 'bg-success',
        warning  : 'bg-warning',
        danger   : 'bg-danger',
        info     : 'bg-info',
        parchment: 'bg-parchment',
        netural  : 'bg-netural',
        gold     : 'bg-gold',
        red      : 'bg-red',
        orange   : 'bg-orange',
        yellow   : 'bg-yellow',
        green    : 'bg-green',
        blue     : 'bg-blue',
        purple   : 'bg-purple',
      }
    },
    defaultVariants: {
      variant: 'primary'
    }
  }
)

const textVariant = cva('', 
  {
    variants: {
      variant: {
        primary  : 'text-primary',
        secondary: 'text-secondary',
        accent   : 'text-accent',
        success  : 'text-success',
        warning  : 'text-warning',
        danger   : 'text-danger',
        info     : 'text-info',
        parchment: 'text-parchment',
        netural  : 'text-netural',
        gold     : 'text-gold',
        red      : 'text-red',
        orange   : 'text-orange',
        yellow   : 'text-yellow',
        green    : 'text-green',
        blue     : 'text-blue',
        purple   : 'text-purple',
      }
    }
  }
)

const borderVariant = cva('', 
  {
    variants: {
      variant: {
        primary  : 'border-primary',
        secondary: 'border-secondary',
        accent   : 'border-accent',
        success  : 'border-success',
        warning  : 'border-warning',
        danger   : 'border-danger',
        info     : 'border-info',
        parchment: 'border-parchment',
        netural  : 'border-netural',
        gold     : 'border-gold',
        red      : 'border-red',
        orange   : 'border-orange',
        yellow   : 'border-yellow',
        green    : 'border-green',
        blue     : 'border-blue',
        purple   : 'border-purple',
      }
    }
  }
)

function SectionSwatches({ title, themeName, entries }: { title: string; themeName: ThemeName, entries: Array<[string, string]> }) {
  const theme = themes[themeName]
  
  if (!theme) {
    console.error('Theme not found:', themeName, 'Available themes:', Object.keys(themes))
    return <div>Theme not found: {themeName}</div>
  }
  
  const materialized = materializeTheme(theme)

  return (
    <section>
      <div className="p-4">
        <h2>{title}</h2>
      </div>
      <Separator />
      <div className="flex flex-wrap gap-3 p-4">
        {entries.map(([key, value]) => {
          const variant = key as keyof typeof variantConfig
          
          return (
            <div key={key} className="flex flex-col items-center gap-1 text-sm">
              <div className={bgVariant({ variant })}/>
              <div className={textVariant({ variant})}>{key}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function Theme() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Parse current theme and mode from the theme string
  const parseTheme = (themeValue: string | undefined) => {
    if (!themeValue) return { themeName: 'peeps' as ThemeName, mode: 'light' }
    
    const parts = themeValue.split('-')
    if (parts.length === 2) {
      return { 
        themeName: parts[0] as ThemeName, 
        mode: parts[1] as 'light' | 'dark' 
      }
    }
    
    // Handle legacy theme names or single theme names
    if (themeValue === 'light' || themeValue === 'dark') {
      return { themeName: 'peeps' as ThemeName, mode: themeValue as 'light' | 'dark' }
    }
    
    return { themeName: themeValue as ThemeName, mode: 'light' as 'light' | 'dark' }
  }

  const { themeName, mode } = parseTheme(theme)
  
  console.log('Current theme:', theme, 'Parsed:', { themeName, mode })
  
  const handleThemeChange = (newThemeName: ThemeName) => {
    setTheme(newThemeName)
  }
  
  const handleModeToggle = () => {
    const isDarkMode = mode === 'dark'
    setTheme(isDarkMode ? themeName : `${themeName}-dark`)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6 relative">
      <div className="flex items-center justify-between gap-4 sticky -top-8 z-10 py-4">
        <h1>Theme Preview</h1>
        <ThemeSwitcher />
      </div>

      {mounted && (
        <div className="space-y-6">
          <SectionSwatches title="colors" themeName={themeName} entries={Object.entries(themes[themeName].colors)} />
          <SectionSwatches title="brand" themeName={themeName} entries={Object.entries(themes[themeName].colors.brand)} />
          <SectionSwatches title="semantic" themeName={themeName} entries={Object.entries(themes[themeName].colors.semantic)} />
        </div>
      )}

      <section className="rounded-xl">
        <div className="p-4">
          <h2>Component examples</h2>
           <p>A few shadcn components using theme tokens.</p>
        </div>
        <Separator />
        <div className="grid gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="muted">Muted</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <Input placeholder="Input" />
          <div>Muted helper text</div>
        </div>
      </section>

      <section>
        <div className="p-4">
          <h2>Typography</h2>
          <p>Font families used across the theme.</p>
        </div>
        <Separator />
        <div className="grid gap-6 p-4">
          <div>
            <div>Headings (font-peeps)</div>
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <h5>Heading 5</h5>
            <h6>Heading 6</h6>
          </div>
          <Separator />
          <div>
            <div>Body (font-serif)</div>
            <p>The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
            <p className="text-muted-foreground">Secondary body text with muted color.</p>
          </div>
          <Separator />
          <div>
            <div>UI Controls (font-sans)</div>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Button</Button>
              <Input className="w-48" placeholder="Input field" />
              <label>Label text</label>
            </div>
          </div>
          <Separator />
          <div>
            <div>Code (font-mono)</div>
            <pre><code>const greeting = &quot;Hello, world!&quot;;</code></pre>
            <p>Inline <code>code snippet</code> example.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

Theme.displayName = "Theme"
export default Theme
