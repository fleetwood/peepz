import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { resolveColorRef, themeNames, themes } from "@peeps/ui"
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
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Theme Preview</h1>
        <ThemeSwitcher />
      </div>

      {themeNames.map((name) => (
        <div key={name} className="space-y-6">
          <PaletteGrid title={`${name} palette`} themeName={name} />
          <SectionSwatches title={`${name} brand`} themeName={name} sectionName="brand" />
          <SectionSwatches title={`${name} semantic`} themeName={name} sectionName="semantic" />
        </div>
      ))}

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
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <Input placeholder="Input" />
          <div className="rounded-md bg-muted text-muted-foreground px-3 py-2 text-sm">Muted helper text</div>
        </div>
      </section>
    </div>
  )
}

Theme.displayName = "Theme"
export default Theme
