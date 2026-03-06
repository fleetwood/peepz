import fs from "node:fs"
import path from "node:path"
import url from "node:url"
import ui from "@peeps/ui"

const logger = {
  debug: (msg, ...args) => console.log(`🔍 [generate-themes-css] ${msg}`, ...args),
  info: (msg, ...args) => console.log(`ℹ️ [generate-themes-css] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`❌ [generate-themes-css] ${msg}`, ...args),
}

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, "..")
const outFile = path.join(webRoot, "assets", "css", "themes.css")

const { materializeTheme, themeNames, themes } = ui

const fontMap = {
  "Gluten": "var(--font-gluten)",
  "Patrick Hand": "var(--font-patrick-hand)",
  "Montserrat": "var(--font-montserrat)",
  "Merriweather": "var(--font-merriweather)",
  "Domine": "var(--font-domine)",
  "Fraunces": "var(--font-fraunces)",
  "Inconsolata": "var(--font-inconsolata)",
  "DM Mono": "var(--font-dm-mono)",
}

function mapFontToVar(fontName) {
  if (!fontName) return fontMap["Gluten"]
  return fontMap[fontName] ?? fontMap["Gluten"]
}

function toCssVars(themeName, mode = "light") {
  const theme = materializeTheme(themes[themeName])
  const brand = theme.colors.brand
  const semantic = theme.colors.semantic

  const paletteVars = []
  for (const [paletteName, paletteObj] of Object.entries(theme.colors)) {
    if (paletteObj && typeof paletteObj === 'object' && paletteObj !== null && paletteName !== "brand" && paletteName !== "semantic" && paletteName !== "dark") {
      if ('DEFAULT' in paletteObj) {
        paletteVars.push(`--${paletteName}:${paletteObj.DEFAULT}`)
      }
    }
  }

  let pageBg = brand.page
  let pageFg = brand["page-foreground"]
  if (mode === "dark" && theme.colors.dark) {
    const darkBg = theme.colors.dark.page
    const darkFg = theme.colors.dark["page-foreground"]
    
    if (darkBg.includes('.')) {
      const [paletteName, shade] = darkBg.split('.')
      pageBg = theme.colors[paletteName][shade]
    } else {
      pageBg = darkBg
    }
    
    if (darkFg.includes('.')) {
      const [paletteName, shade] = darkFg.split('.')
      pageFg = theme.colors[paletteName][shade]
    } else {
      pageFg = darkFg
    }
  }

  const muted = brand.muted ?? brand.secondary
  const mutedForeground = brand["muted-foreground"] ?? brand["secondary-foreground"]

  const fonts = theme.fonts ?? {}
  const fontPeeps = mapFontToVar(fonts.peeps ?? "Gluten")
  const fontSans = mapFontToVar(fonts.sans ?? "Montserrat")
  const fontSerif = mapFontToVar(fonts.serif ?? "Domine")
  const fontMono = mapFontToVar(fonts.mono ?? "Inconsolata")

  function resolveColor(colorRef) {
    if (typeof colorRef !== 'string') return colorRef
    if (colorRef.includes('.')) {
      const [paletteName, shade] = colorRef.split('.')
      return theme.colors[paletteName]?.[shade] || colorRef
    }
    return theme.colors[colorRef]?.DEFAULT || colorRef
  }

  return [
    ...paletteVars,
    `--page:${pageBg}`,
    `--page-foreground:${pageFg}`,
    `--background:${pageBg}`,
    `--foreground:${pageFg}`,
    `--card:${pageBg}`,
    `--card-foreground:${pageFg}`,
    `--popover:${pageBg}`,
    `--popover-foreground:${pageFg}`,
    `--font-peeps:${fontPeeps}`,
    `--font-sans:${fontSans}`,
    `--font-serif:${fontSerif}`,
    `--font-mono:${fontMono}`,
    `--muted:${muted}`,
    `--muted-foreground:${mutedForeground}`,
    `--border:${resolveColor(brand.secondary)}`,
    `--input:${resolveColor(brand.secondary)}`,
    `--ring:${resolveColor(brand.accent)}`,
    `--destructive:${resolveColor(semantic.danger)}`,
    `--destructive-foreground:${resolveColor(semantic["danger-foreground"])}`,
    `--primary:${resolveColor(brand.primary)}`,
    `--primary-foreground:${resolveColor(brand["primary-foreground"])}`,
    `--secondary:${resolveColor(brand.secondary)}`,
    `--secondary-foreground:${resolveColor(brand["secondary-foreground"])}`,
    `--accent:${resolveColor(brand.accent)}`,
    `--accent-foreground:${resolveColor(brand["accent-foreground"])}`,
    `--success:${resolveColor(semantic.success)}`,
    `--success-foreground:${resolveColor(semantic["success-foreground"])}`,
    `--warning:${resolveColor(semantic.warning)}`,
    `--warning-foreground:${resolveColor(semantic["warning-foreground"])}`,
    `--danger:${resolveColor(semantic.danger)}`,
    `--danger-foreground:${resolveColor(semantic["danger-foreground"])}`,
    `--info:${resolveColor(semantic.info)}`,
    `--info-foreground:${resolveColor(semantic["info-foreground"])}`,
    `--radius:${theme.radii?.md || 10}px`,
  ].join(";")
}

const css = [
  ...themeNames.flatMap((themeName) => {
    const theme = themes[themeName]
    return [
      `[data-theme="${themeName}"]{${toCssVars(themeName, "light")}}`,
      `[data-theme="${themeName}"][data-mode="dark"]{${toCssVars(themeName, "dark")}}`,
    ]
  }),
  "",
].join("\n")

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, css, "utf8")

themeNames.forEach((name) => console.log(`Generated CSS vars for theme ${name} to ${outFile}`))
