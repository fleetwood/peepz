type ColorRef = `${string}.${string}`

type RecordUnknown = Record<string, unknown>

type ResolvedSection = Record<string, string>

type Theme = {
  colors: RecordUnknown
}

function isColorRef(value: string): value is ColorRef {
  return value.includes('.') && !value.startsWith('#')
}

export function resolveColorRef(theme: Theme, ref: ColorRef): string {
  const [paletteName, shade] = ref.split('.', 2)
  const palette = (theme.colors as RecordUnknown)[paletteName]

  if (!palette || typeof palette !== 'object') {
    throw new Error(`Unknown palette: ${paletteName}`)
  }

  const color = (palette as RecordUnknown)[shade]

  if (typeof color !== 'string') {
    throw new Error(`Unknown shade: ${paletteName}.${shade}`)
  }

  return color
}

function resolveSection(theme: Theme, section: RecordUnknown): ResolvedSection {
  const out: ResolvedSection = {}

  for (const [key, value] of Object.entries(section)) {
    if (typeof value !== 'string') continue

    out[key] = isColorRef(value) ? resolveColorRef(theme, value) : value
  }

  return out
}

export function materializeTheme(theme: Theme) {
  const colors = theme.colors as RecordUnknown

  return {
    ...theme,
    colors: {
      ...colors,
      brand   : resolveSection(theme, colors.brand as RecordUnknown),
      semantic: resolveSection(theme, colors.semantic as RecordUnknown),
    },
  }
}
