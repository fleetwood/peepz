export function transitionPlugin(api: any) {
  const { addUtilities, theme } = api
  const durations = theme('transitionDuration')

  const transitionUtilities = Object.entries(durations).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`.transition-ease-${key}`]: {
        transitionProperty      : 'all',
        transitionTimingFunction: 'ease-in-out',
        transitionDuration      : value,
      },
      [`.transition-ease-out-${key}`]: {
        transitionProperty      : 'all',
        transitionTimingFunction: 'ease-out',
        transitionDuration      : value,
      },
      [`.transition-ease-in-${key}`]: {
        transitionProperty      : 'all',
        transitionTimingFunction: 'ease-in',
        transitionDuration      : value,
      },
    }),
    {}
  )

  addUtilities(transitionUtilities)
}
