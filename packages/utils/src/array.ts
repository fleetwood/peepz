export function randNum(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randArray<T>(arr: T[], min = 0, max?: number): T[] {
  const len = arr.length
  const count = randNum(min, Math.min(max ?? len, len))

  if (count > len / 2) {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, count)
  }

  const selected = new Set<T>()
  while (selected.size < count) {
    selected.add(arr[Math.floor(Math.random() * len)])
  }

  return Array.from(selected)
}
