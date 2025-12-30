import fs from "node:fs"
import path from "node:path"
import url from "node:url"
import ui from "@peeps/ui"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, "..")
const outFile = path.join(webRoot, "app", "themes.css")

const { materializeTheme, themeNames, themes } = ui

function toCssVars(themeName) {
  const theme = materializeTheme(themes[themeName])
  const brand = theme.colors.brand
  const semantic = theme.colors.semantic

  return [
    `--background:${brand.page}`,
    `--foreground:${brand["page-foreground"]}`,
    `--card:${brand.page}`,
    `--card-foreground:${brand["page-foreground"]}`,
    `--popover:${brand.page}`,
    `--popover-foreground:${brand["page-foreground"]}`,
    `--muted:${brand.secondary}`,
    `--muted-foreground:${brand["secondary-foreground"]}`,
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
