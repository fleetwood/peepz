export type PeepsTheme = {
  name  : string
  icon  : string
  fonts : PeepsFonts
  colors: BrandPalette & 
    {
      brand   : Record<string, string>
      semantic: Record<string, string>
    } & {
      [additionalPalette: string]: Palette
    }
  radii     : Record<string, number>
  spacing   : Record<string, number>
  typography: {
    fontSize  : Record<string, number>
    lineHeight: Record<string, number>
    fontWeight: Record<string, number>
  }
}

export type PeepsFonts = {
  peeps: string
  sans : string
  serif: string
  mono : string
}

export type Palette = {
  DEFAULT: string
  50     : string
  100    : string
  200    : string
  300    : string
  400    : string
  500    : string
  600    : string
  700    : string
  800    : string
  900    : string
  950    : string
}

export type BrandPalette = {
  neutral: Palette
  red    : Palette
  orange : Palette
  yellow : Palette
  green  : Palette
  blue   : Palette
  purple : Palette
}
