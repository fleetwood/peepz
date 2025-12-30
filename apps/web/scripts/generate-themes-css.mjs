import fs from "node:fs"
import path from "node:path"
import url from "node:url"
import ui from "@peeps/ui"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, "..")
const outFile = path.join(webRoot, "app", "themes.css")

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

function toCssVars(themeName) {
  const theme = materializeTheme(themes[themeName])
  const brand = theme.colors.brand
  const semantic = theme.colors.semantic

  const muted = brand.muted ?? brand.secondary
  const mutedForeground = brand["muted-foreground"] ?? brand["secondary-foreground"]

  const fonts = theme.fonts ?? {}
  const fontPeeps = mapFontToVar(fonts.peeps ?? "Gluten")
  const fontSans = mapFontToVar(fonts.sans ?? "Montserrat")
  const fontSerif = mapFontToVar(fonts.serif ?? "Domine")
  const fontMono = mapFontToVar(fonts.mono ?? "Inconsolata")

  return [
    `--background:${brand.page}`,
    `--foreground:${brand["page-foreground"]}`,
    `--card:${brand.page}`,
    `--card-foreground:${brand["page-foreground"]}`,
    `--popover:${brand.page}`,
    `--popover-foreground:${brand["page-foreground"]}`,
    `--font-peeps:${fontPeeps}`,
    `--font-sans:${fontSans}`,
    `--font-serif:${fontSerif}`,
    `--font-mono:${fontMono}`,
    `--muted:${muted}`,
    `--muted-foreground:${mutedForeground}`,
    `--border:${brand.secondary}`,
    `--input:${brand.secondary}`,
    `--ring:${brand.accent}`,
    `--destructive:${semantic.danger}`,
    `--destructive-foreground:${semantic["danger-foreground"]}`,
    `--primary:${brand.primary}`,
    `--primary-foreground:${brand["primary-foreground"]}`,
    `--secondary:${brand.secondary}`,
    `--secondary-foreground:${brand["secondary-foreground"]}`,
    `--accent:${brand.accent}`,
    `--accent-foreground:${brand["accent-foreground"]}`,
    `--success:${semantic.success}`,
    `--success-foreground:${semantic["success-foreground"]}`,
    `--warning:${semantic.warning}`,
    `--warning-foreground:${semantic["warning-foreground"]}`,
    `--danger:${semantic.danger}`,
    `--danger-foreground:${semantic["danger-foreground"]}`,
    `--info:${semantic.info}`,
    `--info-foreground:${semantic["info-foreground"]}`,
  ].join(";")
}

const css = [
  ...themeNames.map((name) => `:root[data-theme="${name}"]{${toCssVars(name)}}`),
  "",
].join("\n")

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, css, "utf8")
