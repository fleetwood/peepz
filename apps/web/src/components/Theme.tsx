"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { resolveColorRef, themeNames, themes } from "@peeps/ui"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import ThemeSwitcher from "./ThemeSwitcher"

export type ThemeProps = Record<string, never>

type Palette = Record<string, string>

function isColorRef(value: string) {
  return value.includes(".") && !value.startsWith("#")
}

type ThemeName = keyof typeof themes

function resolveThemeColor(themeName: ThemeName, value: string) {
  return isColorRef(value) ? resolveColorRef(themes[themeName], value as `${string}.${string}`) : value
}

function getShadeKeys(palette: Palette) {
  const keys = Object.keys(palette)
  const ordered = keys
    .filter((k) => k !== "DEFAULT")
    .sort((a, b) => Number(a) - Number(b))

  return ["DEFAULT", ...ordered].filter((k) => k in palette)
}

function SectionSwatches({ title, themeName, sectionName }: { title: string; themeName: ThemeName; sectionName: "brand" | "semantic" }) {
  const section = (themes[themeName].colors as Record<string, unknown>)[sectionName] as Record<string, string>
  const entries = Object.entries(section)

  return (
    <section className="rounded-xl border border-border">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <Separator />
      <div className="flex flex-wrap gap-3 p-4">
        {entries.map(([key, value]) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-md border border-border" style={{ backgroundColor: resolveThemeColor(themeName, value) }} />
            <div className="text-[10px]">{key}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PaletteGrid({ title, themeName }: { title: string; themeName: ThemeName }) {
  const theme = themes[themeName]
  const entries = Object.entries(theme.colors as Record<string, unknown>).filter(
    ([name, value]) => typeof value === "object" && value !== null && name !== "brand" && name !== "semantic"
  ) as Array<[string, Palette]>

  return (
    <section className="rounded-xl border border-border">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <Separator />
      <div className="grid gap-4 p-4">
        {entries.map(([name, palette]) => (
          <div key={name} className="rounded-lg border border-border bg-card p-3">
            <div className="mb-2 text-sm font-medium text-foreground">{name}</div>
            <div className="flex flex-wrap gap-2">
              {getShadeKeys(palette).map((shade) => (
                <div key={shade} className="flex flex-col items-center gap-1">
                  <div
                    className="h-9 w-9 rounded-md border border-border"
                    style={{ backgroundColor: resolveThemeColor(themeName, palette[shade]) }}
                  />
                  <div className="text-[10px]">{shade}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const Theme = (_props: ThemeProps) => {
  const { theme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const currentThemeName = ((theme as ThemeName | undefined) ?? themeNames[0])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6 relative">
      <div className="flex items-center justify-between gap-4 sticky -top-8 z-10 bg-background border-b border-primary py-4">
        <h1 className="text-2xl font-bold text-foreground">Theme Preview</h1>
        <ThemeSwitcher />
      </div>

      {mounted && (
        <div className="space-y-6">
          <PaletteGrid title="palette" themeName={currentThemeName} />
          <SectionSwatches title="brand" themeName={currentThemeName} sectionName="brand" />
          <SectionSwatches title="semantic" themeName={currentThemeName} sectionName="semantic" />
        </div>
      )}

      <section className="rounded-xl border border-border">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground">Component examples</h2>
           <p className="text-sm">A few shadcn components using theme tokens.</p>
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
          <div className="rounded-md bg-muted text-muted-foreground px-3 py-2 text-sm">Muted helper text</div>
        </div>
      </section>

      <section className="rounded-xl border border-border">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground">Typography</h2>
          <p className="text-sm">Font families used across the theme.</p>
        </div>
        <Separator />
        <div className="grid gap-6 p-4">
          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Headings (font-peeps)</div>
            <h1 className="text-4xl">Heading 1</h1>
            <h2 className="text-3xl">Heading 2</h2>
            <h3 className="text-2xl">Heading 3</h3>
            <h4 className="text-xl">Heading 4</h4>
            <h5 className="text-lg">Heading 5</h5>
            <h6 className="text-base">Heading 6</h6>
          </div>
          <Separator />
          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Body (font-serif)</div>
            <p>The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
            <p className="mt-2 text-sm text-muted-foreground">Secondary body text in a smaller size with muted color.</p>
          </div>
          <Separator />
          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">UI Controls (font-sans)</div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Button</Button>
              <Input className="w-48" placeholder="Input field" />
              <label className="text-sm">Label text</label>
            </div>
          </div>
          <Separator />
          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Code (font-mono)</div>
            <pre className="rounded-md bg-muted p-3 text-sm"><code>const greeting = &quot;Hello, world!&quot;;</code></pre>
            <p className="mt-2">Inline <code className="rounded bg-muted px-1 py-0.5 text-sm">code snippet</code> example.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

Theme.displayName = "Theme"
export default Theme
