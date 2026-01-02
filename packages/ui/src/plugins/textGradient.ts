/**
 * Function provided by Tailwind to access theme values
 * @param path - The dot-notation path to the theme value (e.g., 'colors.primary')
 */
type ThemeFunction = (path: string) => any

/**
 * Creates gradient text utilities for applying gradient effects to text
 *
 * @remarks
 * This plugin generates two types of utilities:
 * 1. Single-color gradients: `.text-gradient-{color}` - Gradients from the specified color to foreground
 * 2. Two-color gradients: `.text-gradient-{color1}-{color2}` - Gradients between any two theme colors
 *
 * @example
 * ```tsx
 * // Single-color gradient (gradients to foreground)
 * <h1 className="text-gradient-primary">Hello World</h1>
 *
 * // Two-color gradient
 * <h1 className="text-gradient-primary-accent">Hello World</h1>
 *
 * // Common color combinations
 * text-gradient-primary
 * text-gradient-accent
 * text-gradient-primary-accent
 * text-gradient-destructive-accent
 * ```
 *
 * @param options - Plugin options provided by Tailwind
 * @param options.addUtilities - Function to register the new utilities
 * @param options.theme - Function to access theme values
 */
export function textGradientPlugin(api: any) {
  const { addUtilities, theme } = api as { addUtilities: any; theme: ThemeFunction }
  const colors = theme('colors')

  const textGradientUtilities = Object.entries(colors).reduce((acc, [key, _value]) => {
    // Generate single-color gradients (defaults to foreground)
    const singleColorMask = {
      [`.text-gradient-${key}`]: {
        background: `linear-gradient(to right, hsl(var(--${key})), hsl(var(--foreground)))`,
        'background-clip': 'text',
        '-webkit-background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        color: 'transparent',
        display: 'inline-block',
        'background-size': '100% 100%'
      }
    }

    // Generate two-color gradients for each possible combination
    const twoColorMasks = Object.entries(colors).reduce(
      (colorAcc, [secondKey, _]) => ({
        ...colorAcc,
        [`.text-gradient-${key}-${secondKey}`]: {
          background: `linear-gradient(to right, hsl(var(--${key})), hsl(var(--${secondKey})))`,
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          color: 'transparent',
          display: 'inline-block',
          'background-size': '100% 100%'
        }
      }),
      {}
    )

    return { ...acc, ...singleColorMask, ...twoColorMasks }
  }, {})

  addUtilities(textGradientUtilities)
}
