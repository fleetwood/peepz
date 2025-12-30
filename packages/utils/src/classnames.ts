type ClassValue = string | number | boolean | null | undefined | ClassValue[] | { [key: string]: any }

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = []

  const push = (value: ClassValue): void => {
    if (!value) return
    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value))
      return
    }
    if (Array.isArray(value)) {
      for (const item of value) push(item)
      return
    }
    if (typeof value === 'object') {
      for (const [key, enabled] of Object.entries(value)) {
        if (enabled) classes.push(key)
      }
    }
  }

  for (const input of inputs) push(input)

  return classes.join(' ')
}
