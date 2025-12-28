export const ruid = () => {
  const c = globalThis.crypto
  if (c && 'randomUUID' in c && typeof c.randomUUID === 'function') return c.randomUUID()
  return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export const minId = (id?: string) => id?.split('-')[0] ?? 'undefined'
